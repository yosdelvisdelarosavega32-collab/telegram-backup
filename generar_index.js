import fs from "fs";
import path from "path";

const carpeta = "./CHAT";
const salida = path.join(carpeta, "index.json");
const archivos = fs.readdirSync(carpeta).filter(f => f.startsWith("messages"));
const resultados = [];

console.log(`📂 Analizando ${archivos.length} archivos HTML...\n`);

const regexMsg = /<div class="message (?:default clearfix|default clearfix joined)"(?: id="([^"]+)")?>([\s\S]*?)<\/div>\s*<\/div>/g;
const regexName = /<div class="from_name[^>]*>\s*([^<]+)\s*<\/div>/;
const regexText = /<div class="text[^>]*>([\s\S]*?)<\/div>/;
const regexTime = /<div class="pull_right date details"[^>]*>([^<]+)<\/div>/;

for (const archivo of archivos) {
  const html = fs.readFileSync(path.join(carpeta, archivo), "utf8");
  const pagina = archivo === "messages.html" ? 1 : parseInt(archivo.replace("messages", "").replace(".html", ""));
  let coincidencia;
  let contador = 0;
  let ultimoNombre = "";

  while ((coincidencia = regexMsg.exec(html)) !== null) {
    const id = coincidencia[1] || `noid-${pagina}-${contador}`;
    const bloque = coincidencia[2];

    const nombre = regexName.exec(bloque)?.[1]?.trim() || ultimoNombre;
    const hora = regexTime.exec(bloque)?.[1]?.trim() || "";
    const textoBruto = regexText.exec(bloque)?.[1] || "";
    const texto = textoBruto
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (nombre) ultimoNombre = nombre;

    if (texto && texto.length > 0) {
      resultados.push({
        page: pagina,
        id,
        name: nombre,
        time: hora,
        text: texto,
      });
      contador++;
    }
  }

  console.log(`✅ ${archivo} procesado (${contador} mensajes encontrados, total ${resultados.length})`);
}

fs.writeFileSync(salida, JSON.stringify(resultados, null, 2), "utf8");
console.log(`\n🎉 Listo! Se generó ${salida} con ${resultados.length} mensajes totales.`);
