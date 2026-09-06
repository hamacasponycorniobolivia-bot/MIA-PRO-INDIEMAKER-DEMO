#!/bin/bash

REPORT_FILE="REPORTE_AUDITORIA_MIA_PRO.txt"
echo "==================================================" > $REPORT_FILE
echo "       AUDITORÍA INTEGRAL MIA PRO V1.0 RC         " >> $REPORT_FILE
echo "       Fecha: $(date)" >> $REPORT_FILE
echo "==================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[+] 1. VERIFICACIÓN DE ARCHIVOS CRÍTICOS Y ESTRUCTURA..." >> $REPORT_FILE
REQUIRED_FILES=(
    "backend/package.json"
    "backend/server.js"
    "backend/outboxService.js"
    "backend/reconciliationService.js"
    "backend/prisma/schema.prisma"
    "src/MIAMarketplace.sol"
    "foundry.toml"
    "backend/docker-compose.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  [OK] $file presente" >> $REPORT_FILE
    else
        echo "  [ALERTA] $file FALTANTE" >> $REPORT_FILE
    fi
done
echo "" >> $REPORT_FILE

echo "[+] 2. ESCANEO DE SEGURIDAD (Variables sensibles en texto plano)..." >> $REPORT_FILE
grep -rnw --exclude-dir={node_modules,.git,out,cache} --exclude="*.env*" -iE '(private_key|secret|password|mnemonic)\s*=\s*["'\''"][^"'\''"]+["'\''"]' . >> $REPORT_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "  [OK] No se detectaron credenciales hardcodeadas explícitas." >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

echo "[+] 3. AUDITORÍA DE CONTRATOS INTELIGENTES (FOUNDRY)..." >> $REPORT_FILE
if command -v forge &> /dev/null; then
    forge test >> $REPORT_FILE 2>&1
    if [ $? -eq 0 ]; then
        echo "  [OK] Pruebas unitarias de Smart Contracts superadas." >> $REPORT_FILE
    else
        echo "  [ERROR] Fallaron las pruebas en Forge. Revisa los logs arriba." >> $REPORT_FILE
    fi
else
    echo "  [OMITIDO] Forge (Foundry) no está instalado o no está en el PATH." >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

echo "[+] 4. AUDITORÍA DE DEPENDENCIAS BACKEND (NPM AUDIT)..." >> $REPORT_FILE
if [ -d "backend" ]; then
    cd backend
    npm audit --audit-level=high >> ../$REPORT_FILE 2>&1
    cd ..
else
    echo "  [ERROR] Directorio backend no encontrado." >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

echo "[+] 5. DETECCIÓN DE BASURA Y DEUDA TÉCNICA (Backups y temporales)..." >> $REPORT_FILE
BACKUP_FILES=$(find . -maxdepth 3 \( -name "*.backup*" -o -name "*.bak*" -o -name "*CLEAN_BACKUP*" \))
if [ -n "$BACKUP_FILES" ]; then
    echo "  [ADVERTENCIA] Archivos de backup detectados en producción:" >> $REPORT_FILE
    echo "$BACKUP_FILES" >> $REPORT_FILE
else
    echo "  [OK] Limpieza de directorio correcta. No se hallaron backups sueltos." >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

echo "==================================================" >> $REPORT_FILE
echo "       AUDITORÍA FINALIZADA EXITOSAMENTE           " >> $REPORT_FILE
echo "==================================================" >> $REPORT_FILE

echo "Auditoría completada. Guardada en: $REPORT_FILE"
