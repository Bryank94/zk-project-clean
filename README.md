# zk-project

Sistema de prueba Zero Knowledge para validación de score financiero sin revelar datos sensibles.

---

## Statement

La prueba demuestra que existe un valor de score `s`, emitido por un emisor autorizado, asociado a una PYME cuya identidad está representada mediante un commitment público `c_id`, tal que:

- el score ha sido correctamente firmado por el emisor autorizado,
- el score está criptográficamente ligado a la identidad de la PYME,
- el valor `s` cumple la condición `s ≥ threshold`,
- el score no ha expirado y pertenece a un contexto válido,
- y la prueba no ha sido reutilizada (protección contra replay),

todo ello sin revelar ni el valor del score ni la identidad real de la PYME.

---

## Circuit Statement (Formal)

El circuito prueba que existen valores privados:

- score
- pymeWallet
- modelVersion
- timestamp
- expiration
- salt
- signature (R8, S)

tales que se cumplen las siguientes condiciones:

1. El mensaje firmado por el emisor se construye como:

   `issuerMessage = H(score, pymeWallet, modelVersion, timestamp, expiration, salt)`

2. El commitment público corresponde al mensaje:

   `scoreCommitment = issuerMessage`

3. La firma es válida respecto a la clave pública del emisor:

   `EdDSA_verify(issuerPublicKey, issuerMessage, R8, S) = true`

4. El score cumple la condición requerida:

   `score ≥ threshold`

5. La credencial no está expirada:

   `timestamp ≤ expiration`

---

## Actores y modelo de confianza

### Actores

1. **PYME (Prover):** entidad que posee el score y genera la prueba ZK.
2. **Verificador externo:** entidad (ej: banco, aseguradora) que solicita la prueba y verifica que se cumple la condición requerida.
3. **Emisor / Oracle (Wenalyze):** sistema autorizado que genera el score y firma los datos asociados.
4. **Contrato on-chain (ScoreRegistry):** contrato inteligente que almacena los commitments del score y sirve como fuente verificable de datos públicos.

---

### Fuentes de confianza

- **La clave pública del emisor autorizado:** se asume que pertenece a una entidad legítima y no ha sido comprometida.
- **El contrato on-chain ScoreRegistry:** se asume que almacena correctamente los commitments y no puede ser manipulado.
- **Las reglas públicas del sistema:** incluyen la definición del circuito, el esquema de hashing y el formato de los mensajes firmados.
- **Función hash Poseidon** y **circuito ZK**: se consideran correctos y no manipulados.

---

### Entidades no confiables

- La PYME (prover): se considera siempre potencialmente maliciosa.
- El frontend: puede ser manipulado o falsificado.
- El backend del prover: no se asume como fuente fiable.
- Cualquier input proporcionado por la PYME que no esté firmado criptográficamente por el emisor o comprometido mediante un hash verificable.

---

### Regla clave

El prover se considera siempre potencialmente malicioso, por lo que ninguna afirmación proporcionada por él se considera válida a menos que esté verificada criptográficamente dentro del circuito.

---

### Implicaciones para el diseño

- El circuito debe verificar todas las condiciones críticas: validez de la firma del emisor, correspondencia entre commitments y valores privados, y cumplimiento de la condición `s ≥ threshold`.
- No se puede confiar en ningún valor proporcionado por el prover sin verificación dentro del circuito.
- La autenticidad del score depende exclusivamente de la firma del emisor autorizado.

---

## Condiciones verificables

1. El commitment del score proporcionado públicamente corresponde al valor privado `s`.
2. El commitment de identidad corresponde a la wallet privada de la PYME.
3. El mensaje que contiene `(score, identidad, metadatos)` ha sido firmado por el emisor autorizado.
4. La firma es válida respecto a la clave pública del emisor.
5. El score `s` cumple la condición `s ≥ threshold`.
6. Todos los valores utilizados en la prueba están correctamente ligados entre sí mediante hashes criptográficos.
7. La clave pública utilizada para verificar la firma corresponde a un emisor autorizado.

---

## Binding criptográfico

El score no debe existir como un dato aislado, sino como parte de una credencial criptográficamente ligada a su contexto. Para evitar manipulaciones, el sistema fija de forma estable qué campos forman el mensaje firmado por el emisor, qué valor se registra on-chain y qué elementos se usan para prevenir reutilización indebida de pruebas.

---

### Campos que forman la credencial

La credencial de score queda ligada, como mínimo, a los siguientes campos:

- `score`
- `pymeWallet`
- `modelVersion`
- `timestamp`
- `expiration`
- `salt`

Campos opcionales de endurecimiento futuro:

- `schemaVersion`
- `verifierChallenge`
- `sessionContext`

---

### Qué firma el emisor

El emisor autorizado firma un mensaje estructurado que incluye todos los campos relevantes de la credencial:

```
issuerMessage = Poseidon(score, pymeWallet, modelVersion, timestamp, expiration, salt)
```

El orden de los campos forma parte de la definición del mensaje y no puede modificarse sin invalidar la firma.

---

### Qué se registra on-chain

El valor registrado on-chain en `ScoreRegistry` es un commitment derivado de la credencial completa:

```
scoreCommitment = Poseidon(score, pymeWallet, modelVersion, timestamp, expiration, salt)
```

Este commitment actúa como referencia pública verificable de la credencial emitida.

---

### Qué verifica el circuito

1. Recalcular el `scoreCommitment` a partir de los valores privados.
2. Comprobar que el commitment recalculado coincide con el commitment público registrado.
3. Recalcular `issuerMessage`.
4. Verificar que la firma del emisor es válida sobre `issuerMessage`.
5. Verificar que el score satisface la condición `score ≥ threshold`.
6. Verificar que la credencial no está expirada.
7. Verificar que el nullifier es correcto.

---

### Qué se usa para anti-replay

Para evitar reutilización de pruebas, el sistema introduce un identificador de uso único (`nullifier`) y un contexto de sesión proporcionado por el verificador:

```
nullifier = Poseidon(pymeWallet, verifierChallenge, salt)
```

donde:

- `pymeWallet` identifica al titular legítimo,
- `verifierChallenge` introduce contexto de sesión,
- `salt` evita correlación directa entre usos.

El `nullifier` se publica como input del circuito y puede marcarse como usado on-chain para impedir replay de la misma prueba en el mismo contexto.

---

### Separación de funciones criptográficas

El sistema distingue tres valores criptográficos diferentes:

- `issuerMessage`: mensaje completo firmado por el emisor autorizado.
- `scoreCommitment`: commitment público registrado on-chain que representa la credencial emitida.
- `nullifier`: valor derivado usado para prevenir replay y reutilización indebida de pruebas.

---

## Inputs del circuito

### Public Inputs

- `threshold`: valor mínimo requerido por el verificador.
- `scoreCommitment`: hash criptográfico del score registrado (Poseidon).
- `pymeIdentityCommitment`: commitment público que representa la identidad de la PYME.
- `issuerPublicKey`: clave pública del emisor autorizado que firma el score.
- `currentTime`: tiempo actual proporcionado por el verificador para validar expiración.
- `verifierChallenge`: valor aleatorio proporcionado por el verificador para evitar replay.
- `nullifier`: valor público derivado que identifica de forma única el uso de la credencial en un contexto dado.

### Private Inputs (Witness)

- `rawScore (s)`: valor real del score generado por el emisor.
- `pymeWallet`: dirección real de la wallet de la PYME.
- `commitmentSecret (salt)`: valor aleatorio utilizado para generar los commitments.
- `modelVersion`: versión del modelo de scoring utilizado.
- `timestamp`: momento de emisión de la credencial.
- `expiration`: fecha límite de validez de la credencial.
- `R8, S`: componentes de la firma digital generada por el emisor sobre el mensaje.

---

### Valores que NO son public inputs

Los siguientes valores no deben exponerse como inputs públicos porque son sensibles o forman parte del witness privado:

- `rawScore`
- `pymeWallet`
- `modelVersion`
- `timestamp`
- `expiration`
- `salt`
- `R8`
- `S`

Estos valores participan en constraints internos del circuito, pero no deben revelarse al verificador.

---

### Decisión final

El nuevo circuito de Fase 2 utilizará exactamente cinco public inputs:

`threshold`, `scoreCommitment`, `pymeIdentityCommitment`, `issuerPublicKey`, `challenge`.

---

## Constraints del circuito

### 1. Hash correcto

```
Poseidon(rawScore, pymeWallet, modelVersion, timestamp, expiration, salt) == scoreCommitment
```

### 2. Firma válida

```
EdDSA_verify(R8, S, issuerMessage, issuerPublicKey) == true
```

### 3. Integridad de identidad

```
Poseidon(pymeWallet, commitmentSecret) == pymeIdentityCommitment
```

### 4. Condición de score

```
rawScore ≥ threshold
```

### 5. Validez temporal

```
expiration > currentTime
```

### 6. Nullifier correcto

```
Poseidon(pymeWallet, verifierChallenge, commitmentSecret) == nullifier
```

---

## Esquema de firma del emisor

### Decisión final

El sistema utiliza **EdDSA sobre la curva BabyJub**, compatible con verificación en circuitos Circom mediante `circomlib`.

### Justificación

Se elige EdDSA sobre BabyJub porque:

- es compatible con verificación eficiente dentro de circuitos ZK,
- está soportado por `circomlib`,
- su coste en constraints es razonable en comparación con alternativas clásicas,
- encaja mejor con un flujo de prueba en Circom que esquemas como ECDSA o RSA.

### Alternativas descartadas

- **ECDSA:** su verificación dentro de circuitos ZK resulta significativamente más costosa.
- **RSA:** no es una opción práctica por su elevado coste computacional dentro de circuitos de conocimiento cero.

### Componentes de la firma

- `issuerPublicKey[2]`: clave pública del emisor autorizado (input público).
- `R8[2]`: componente de la firma EdDSA correspondiente al punto efímero (input privado).
- `S`: componente escalar de la firma EdDSA (input privado).

---

## Firma del emisor (off-chain)

La generación de la firma del emisor ocurre fuera del circuito ZK. El circuito no genera firmas, únicamente verifica que la firma proporcionada es válida.

### 1. Construcción del mensaje

```
message = Poseidon(score, pymeWallet, modelVersion, timestamp, expiration, salt)
```

### 2. Firma del mensaje

```
signature = EdDSA.sign(message, sk_emisor)
```

La firma resultante está compuesta por `R8` y `S`.

### 3. Entrega de la credencial a la PYME

El emisor entrega a la PYME todos los datos necesarios para generar la prueba ZK:

- `score`, `pymeWallet`, `modelVersion`, `timestamp`, `expiration`, `salt`, `R8`, `S`

### 4. Uso de la credencial por la PYME (prover)

La PYME utiliza estos valores como inputs privados (witness) para generar la prueba ZK. El circuito reconstruirá el mensaje y verificará que la firma `(R8, S)` es válida respecto a la `issuerPublicKey` sobre el `issuerMessage` correcto.

### Regla crítica de consistencia

La implementación del emisor y la del circuito deben usar el mismo hash (Poseidon), el mismo orden de campos y la misma codificación. Cualquier diferencia hará que la verificación de la firma falle.

---

## Flujo del sistema (end-to-end)

### Emisor

1. Calcula el score de la PYME.
2. Genera `issuerMessage = Poseidon(score, pymeWallet, modelVersion, timestamp, expiration, salt)`.
3. Firma con su clave privada: `signature = EdDSA.sign(issuerMessage, sk_emisor)`.
4. Entrega la credencial completa a la PYME.

### Prover (PYME)

1. Recibe la credencial del emisor.
2. Construye el witness con los inputs privados.
3. Genera la prueba ZK.

### Verificador

1. Proporciona `verifierChallenge` aleatorio.
2. Verifica la prueba con `verification_key`.
3. Comprueba que el `nullifier` no ha sido usado previamente (on-chain).

---

## Checklist de seguridad

- El prover NO puede modificar el score sin invalidar la prueba.
- El score está autenticado por el emisor mediante firma EdDSA.
- El commitment liga todos los datos críticos: score, identidad y metadata.
- El threshold es público y proporcionado por el verificador, nunca por el prover.
- La prueba no puede reutilizarse gracias al nullifier y al verifierChallenge.
- El circuito verifica TODAS las condiciones críticas sin confiar en el prover.

---

## Propiedades del sistema

- **Privacidad:** el score no se revela.
- **Integridad:** el score está ligado a la identidad mediante commitments.
- **Autenticidad:** el score proviene de un emisor autorizado.
- **Correctitud:** se verifica que `s ≥ threshold`.
- **Anti-replay:** nullifier + verifierChallenge impiden reutilización de pruebas.

---

## Estructura del proyecto

- `zk-real/`: circuito ZK (Circom + SnarkJS)
- `contracts/`: contrato verificador en Solidity
- `scripts/`: scripts de despliegue y test
- `public/`: interfaz web básica
- `server.js`: backend de simulación
- `docs/phase2_circuit_spec.md`: especificación técnica de la Fase 2 del circuito ZK

---

## ⚠️ Legacy Circuit (Deprecated)

The current circuit implementation is deprecated and kept only for reference.

It does NOT implement:

- secure issuer signature verification
- full cryptographic binding
- replay protection

A new circuit will be implemented from scratch.

---

### ❌ Lo que NO se reutiliza

Las siguientes piezas del circuito actual quedan descartadas en la nueva implementación:

- **Lógica de firma actual:** la verificación de firma no está correctamente implementada y no puede considerarse segura.
- **Estructura de `message`:** el mensaje firmado no estaba correctamente definido ni ligado a todos los campos requeridos.
- **Bindings incompletos:** varios campos de la credencial no estaban incluidos en el commitment ni en el mensaje firmado.
- **Comparadores mal definidos:** algunos constraints de comparación no cubrían todos los casos necesarios.
- **Shortcuts inseguros**, como:

```circom
isValidSignature <== 1;
```

Este tipo de asignación fuerza el resultado sin verificar nada, invalidando la seguridad del circuito.

---

### ✔️ Lo que SÍ se reutiliza

Solo se reutilizan piezas simples, verificables y bien definidas:

- **Poseidon hash:** función hash compatible con ZK, correctamente integrada mediante `circomlib`.
- **Comparator (`GreaterEqThan`):** componente estándar de `circomlib` para verificar `score ≥ threshold`.
- **Estructura básica de inputs:** la separación entre public inputs y private inputs (witness) es correcta y se mantiene.
- **Pipeline de snarkjs:** el flujo de compilación, generación de witness, prueba y verificación funciona correctamente y se conserva íntegro.

---

### Declaración de reescritura

The new circuit will be a full rewrite.

No core cryptographic logic from the legacy circuit will be reused
without explicit review and validation.

---

### Checklist de verificación

- ✔ El circuito legacy está claramente identificado como deprecado.
- ✔ No debe usarse por accidente en scripts de producción ni de test.
- ✔ Está documentado explícitamente como inseguro en este README.
- ✔ Existe un punto de referencia (tag o commit) para volver atrás si es necesario.
- ✔ Las partes que NO deben reutilizarse están listadas de forma explícita.

---

## Tests mínimos del sistema

Se ejecutaron 5 tests para verificar que el circuito acepta únicamente pruebas válidas y rechaza cualquier manipulación de los datos.

---

### Caso correcto

- Modificación: ninguna, inputs válidos.
- Resultado esperado: prueba válida.
- Resultado obtenido: `[INFO] snarkJS: OK!`
- Conclusión: el flujo completo funciona correctamente de extremo a extremo.

---

### Caso 1 — score alterado

- Modificación: cambio de `rawScore` (de 80 a 81).
- Resultado esperado: fallo.
- Resultado obtenido: fallo en `generate_witness` con `Assert Failed`.
- Conclusión: no es posible modificar el score sin invalidar la prueba. El commitment y la firma dejan de ser consistentes.

---

### Caso 2 — wallet alterada

- Modificación: cambio de `pymeWallet` (de 999 a 1000).
- Resultado esperado: fallo.
- Resultado obtenido: fallo en `generate_witness` con `Assert Failed`.
- Conclusión: el sistema impide cambiar la identidad asociada al score. El binding entre wallet y credencial es verificado dentro del circuito.

---

### Caso 3 — timestamp alterado

- Modificación: cambio de `timestamp`.
- Resultado esperado: fallo.
- Resultado obtenido: fallo en `generate_witness` con `Assert Failed`.
- Conclusión: el sistema impide modificar los metadatos temporales de la credencial. Cualquier alteración del timestamp invalida el hash del mensaje y con él la firma.

---

### Caso 4 — firma alterada

- Modificación: se alteró el valor de la firma (`R8` o `S`).
- Resultado esperado: fallo.
- Resultado obtenido: fallo en `generate_witness` con error en `EdDSAPoseidonVerifier`.
- Conclusión: el sistema impide el uso de firmas inválidas y garantiza que solo el emisor autorizado puede generar credenciales válidas.
