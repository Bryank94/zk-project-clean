const express = require("express");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const app = express();
const PORT = 3000;

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

// Endpoint para generar proof
app.get("/prove", (req, res) => {
    try {
        const { score, min, max, age } = req.query;

        if (!score || !min || !max || !age) {
            return res.json({
                success: false,
                error: "Faltan parámetros: score, min, max, age"
            });
        }

        const zkPath = path.join(__dirname, "zk-real");
        const buildPath = path.join(zkPath, "build");

        // 1) Escribir input.json
        const input = {
            score: String(score),
            min: String(min),
            max: String(max),
            age: String(age)
        };

        fs.writeFileSync(
            path.join(buildPath, "input.json"),
            JSON.stringify(input, null, 2)
        );

        // 2) Generar witness
        execSync(
            "node build/circuit_js/generate_witness.js build/circuit_js/circuit.wasm build/input.json build/witness.wtns",
            { cwd: zkPath, stdio: "pipe" }
        );

        // 3) Generar proof
        execSync(
            "snarkjs groth16 prove build/circuit_final.zkey build/witness.wtns build/proof.json build/public.json",
            { cwd: zkPath, stdio: "pipe" }
        );

        // 4) Exportar calldata
        const calldata = execSync(
            "snarkjs zkey export soliditycalldata build/public.json build/proof.json",
            { cwd: zkPath, encoding: "utf8" }
        ).trim();

        // calldata viene como:
        // [pA],[pB],[pC],[pubSignals]
        const [pA, pB, pC, pubSignals] = JSON.parse(`[${calldata}]`);

        return res.json({
            success: true,
            pA,
            pB,
            pC,
            pubSignals
        });
    } catch (error) {
        console.error("ERROR /prove:", error);

        return res.json({
            success: false,
            error: error.message
        });
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});