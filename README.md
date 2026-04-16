# zk-project

Sistema de prueba Zero Knowledge para validación de score financiero sin revelar datos sensibles.

---

## Statement

La prueba demuestra que existe un valor de score `s`, emitido por un emisor autorizado, asociado a una PYME cuya identidad está representada mediante un commitment público `c_id`, tal que:

- el score ha sido correctamente firmado por el emisor autorizado,
- el score está criptográficamente ligado a la identidad de la PYME,
- y el valor `s` cumple la condición `s ≥ threshold`,

todo ello sin revelar ni el valor del score ni la identidad real de la PYME.

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

## Public Inputs

- `threshold`: valor mínimo requerido por el verificador.
- `scoreCommitment`: hash criptográfico del score registrado (ej: Poseidon).
- `pymeIdentityCommitment`: commitment público que representa la identidad de la PYME.
- `issuerPublicKey`: clave pública del emisor autorizado que firma el score.
- `verifierChallenge`: valor aleatorio proporcionado por el verificador para evitar replay.
- `nullifier`: valor público derivado que identifica de forma única el uso de la credencial en un contexto dado.

---

## Private Inputs

- `rawScore (s)`: valor real del score generado por el emisor.
- `pymeWallet`: dirección real de la wallet de la PYME.
- `commitmentSecret (salt)`: valor aleatorio utilizado para generar los commitments.
- `R8, S`: componentes de la firma digital generada por el emisor sobre el mensaje.

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

## Binding criptográfico

El score no debe existir como un dato aislado, sino como parte de una credencial criptográficamente ligada a su contexto. Para evitar manipulaciones, el sistema debe fijar de forma estable qué campos forman el mensaje firmado por el emisor, qué valor se registra on-chain y qué elementos se usan para prevenir reutilización indebida de pruebas.

---

### Campos que forman la credencial

La credencial de score debe quedar ligada, como mínimo, a los siguientes campos:

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

El emisor autorizado debe firmar un mensaje estructurado que incluya todos los campos relevantes de la credencial.

Definición propuesta del mensaje firmado:

`issuerMessage = H(score, pymeWallet, modelVersion, timestamp, expiration, salt)`

donde `H` es una función hash compatible con ZK, preferiblemente Poseidon.

---

### Qué se registra on-chain

El valor registrado on-chain en `ScoreRegistry` debe ser un commitment derivado de la credencial completa, no únicamente del score aislado.

Definición propuesta del commitment registrado:

`scoreCommitment = H(score, pymeWallet, modelVersion, timestamp, expiration, salt)`

Este commitment actúa como referencia pública verificable de la credencial emitida.

---

### Qué verifica el circuito

El circuito ZK debe utilizar como witness privado los valores secretos de la credencial y debe verificar al menos lo siguiente:

1. Recalcular el `scoreCommitment` a partir de los valores privados.
2. Comprobar que el commitment recalculado coincide con el commitment público registrado.
3. Recalcular `issuerMessage`.
4. Verificar que la firma del emisor es válida sobre `issuerMessage`.
5. Verificar que el score satisface la condición `score ≥ threshold`.
6. Verificar que la credencial no está expirada.

---

### Qué se usa para anti-replay

Para evitar reutilización de pruebas, el sistema debe introducir un identificador de uso único (`nullifier`) y un contexto de sesión o challenge del verificador.

Definición propuesta:

`nullifier = H(pymeWallet, verifierChallenge, salt)`

donde:

- `pymeWallet` identifica al titular legítimo,
- `verifierChallenge` introduce contexto de sesión,
- `salt` evita correlación directa entre usos.

El `nullifier` debe publicarse como input del circuito y poder marcarse como usado para impedir replay de la misma prueba en el mismo contexto.

---

### Separación de funciones criptográficas

Para evitar ambigüedades, el sistema distingue tres valores criptográficos diferentes:

- `issuerMessage`: mensaje completo firmado por el emisor autorizado.
- `scoreCommitment`: commitment público registrado on-chain que representa la credencial emitida.
- `nullifier`: valor derivado usado para prevenir replay y reutilización indebida de pruebas.

Esta separación debe mantenerse estable en el diseño del sistema.

---

## Esquema de firma del emisor

Para autenticar la credencial de score dentro del circuito ZK, el sistema debe utilizar un esquema de firma compatible con verificación eficiente en Circom.

---

### Decisión final

El sistema utiliza **EdDSA sobre la curva BabyJub**, compatible con verificación en circuitos Circom mediante `circomlib`.

---

### Justificación

Se elige EdDSA sobre BabyJub porque:

- es compatible con verificación eficiente dentro de circuitos ZK,
- está soportado por `circomlib`,
- su coste en constraints es razonable en comparación con alternativas clásicas,
- encaja mejor con un flujo de prueba en Circom que esquemas como ECDSA o RSA.

---

### Alternativas descartadas

- **ECDSA:** aunque es habitual en entornos blockchain, su verificación dentro de circuitos ZK resulta significativamente más costosa.
- **RSA:** no es una opción práctica para este sistema por su elevado coste computacional dentro de circuitos de conocimiento cero.

---

### Implicaciones para el diseño

Como consecuencia de esta decisión:

- la clave pública del emisor deberá representarse en formato compatible con BabyJub,
- la firma del emisor deberá incluir sus componentes en formato verificable por `circomlib`,
- el circuito deberá verificar la firma EdDSA sobre el mensaje estructurado de la credencial,
- el flujo de emisión deberá generar firmas compatibles con este esquema desde el origen.

---

### Formato esperado

A nivel de circuito, la firma del emisor se representará mediante:

- `issuerPublicKey`: clave pública del emisor autorizado.
- `R8`: primer componente de la firma EdDSA.
- `S`: segundo componente de la firma EdDSA.

---

### Mensaje firmado por el emisor

Para que la firma del emisor tenga significado criptográfico y no pueda reutilizarse sobre datos parciales o ambiguos, el sistema debe fijar de forma exacta el mensaje que se firma.

La firma del emisor debe aplicarse sobre un mensaje estructurado formado por los siguientes campos, en este orden exacto:

1. `score`
2. `pymeWallet`
3. `modelVersion`
4. `timestamp`
5. `expiration`
6. `salt`

Definición formal:

`issuerMessage = H(score, pymeWallet, modelVersion, timestamp, expiration, salt)`

donde `H` es una función hash compatible con ZK, preferiblemente Poseidon.

El orden de los campos forma parte de la definición del mensaje y no puede modificarse sin invalidar la firma. Cualquier implementación del emisor, del circuito o del backend debe utilizar exactamente esta misma estructura.

---

### Justificación de los campos incluidos

- `score`: representa el valor cuya validez se quiere probar.
- `pymeWallet`: liga la credencial a una identidad concreta de la PYME.
- `modelVersion`: permite distinguir qué versión del sistema de scoring generó el resultado.
- `timestamp`: fija el momento de emisión de la credencial.
- `expiration`: permite limitar la validez temporal de la credencial.
- `salt`: aporta aleatoriedad y evita correlación o reutilización trivial de credenciales idénticas.

---

### Implicaciones para el circuito

El circuito deberá reconstruir exactamente `issuerMessage` a partir de los valores privados de la credencial y verificar que la firma EdDSA proporcionada es válida respecto a la `issuerPublicKey` pública.

---

### Regla de consistencia

La implementación del emisor fuera del circuito y la implementación del circuito dentro de Circom deben utilizar la misma función hash, el mismo orden de campos y la misma codificación de datos. Cualquier discrepancia entre ambas invalidará la verificación de la firma.

---

### Representación de la firma en el circuito

La firma del emisor debe entrar al circuito en un formato compatible con la verificación EdDSA sobre BabyJub en `circomlib`.

### Componentes de la firma

La verificación de la firma dentro del circuito utilizará los siguientes elementos:

- `issuerPublicKey`: clave pública del emisor autorizado.
- `R8`: componente de la firma EdDSA correspondiente al punto efímero de la firma.
- `S`: componente escalar de la firma EdDSA.

---

### Clasificación de inputs

- `issuerPublicKey` se tratará como **input público**, ya que identifica al emisor autorizado cuya firma se verifica.
- `R8` y `S` se tratarán como **inputs privados del witness** en el diseño actual del circuito, aunque conceptualmente forman parte de la credencial emitida.

---

### Formato esperado en el circuito

A nivel de señales Circom, la firma se representará de forma compatible con este esquema:

- `issuerPublicKey[2]`
- `R8[2]`
- `S`

---

### Implicaciones para el witness

El witness deberá contener:

- el valor privado de `score`,
- la wallet de la PYME,
- los metadatos de la credencial (`modelVersion`, `timestamp`, `expiration`, `salt`),
- y los componentes de firma `R8` y `S`.

---

### Regla de consistencia de la firma

La firma incluida en el witness debe corresponder exactamente al valor de `issuerMessage` definido previamente. No se aceptará ninguna firma generada sobre un orden distinto de campos, una función hash distinta o una codificación diferente.

---

## Firma del emisor (off-chain)

La generación de la firma del emisor ocurre fuera del circuito ZK, en el sistema del emisor autorizado (por ejemplo, Wenalyze).

El circuito no genera firmas, únicamente verifica que la firma proporcionada es válida.

---

### 1. Construcción del mensaje

El emisor construye el mensaje a firmar utilizando exactamente la estructura definida previamente:

`message = H(score, pymeWallet, modelVersion, timestamp, expiration, salt)`

donde `H` es Poseidon.

Este paso debe respetar estrictamente:

- el orden de los campos,
- el tipo de datos,
- la función hash utilizada.

---

### 2. Firma del mensaje

El emisor firma el mensaje utilizando EdDSA sobre la curva BabyJub:

`signature = EdDSA.sign(message, sk_emisor)`

donde:

- `message` es el hash calculado previamente,
- `sk_emisor` es la clave privada del emisor autorizado.

La firma resultante está compuesta por:

- `R8`
- `S`

---

### 3. Entrega de la credencial a la PYME

El emisor entrega a la PYME todos los datos necesarios para generar la prueba ZK:

- `score`
- `pymeWallet`
- `modelVersion`
- `timestamp`
- `expiration`
- `salt`
- `R8`
- `S`

---

### 4. Uso de la credencial por la PYME (prover)

La PYME utiliza estos valores como inputs privados (witness) para generar la prueba ZK.

El circuito reconstruirá el mensaje y verificará que:

- la firma `(R8, S)` es válida,
- respecto a la `issuerPublicKey`,
- sobre el `issuerMessage` correcto.

---

### Regla crítica de consistencia

La implementación del emisor y la del circuito deben ser completamente consistentes:

- mismo hash (Poseidon),
- mismo orden de campos,
- misma codificación.

Cualquier diferencia entre ambas hará que la verificación de la firma falle.

---

## Objetivo

Permitir que una PYME demuestre que cumple un criterio financiero (por ejemplo, acceso a crédito o seguro) sin revelar:

- su score real,
- su identidad en claro.

---

## Propiedades del sistema

- **Privacidad:** el score no se revela.
- **Integridad:** el score está ligado a la identidad mediante commitments.
- **Autenticidad:** el score proviene de un emisor autorizado.
- **Correctitud:** se verifica que `s ≥ threshold`.

---

## Estructura del proyecto

- `zk-real/`: circuito ZK (Circom + SnarkJS)
- `contracts/`: contrato verificador en Solidity
- `scripts/`: scripts de despliegue y test
- `public/`: interfaz web básica
- `server.js`: backend de simulación

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