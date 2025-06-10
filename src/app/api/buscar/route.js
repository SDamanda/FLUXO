import fs from 'fs';
import path from 'path';

// Função para calcular os dígitos verificadores do CNPJ base
function calcularDvCnpjBase(cnpjBase) {
    cnpjBase = String(cnpjBase).replace(/\D/g, '');
    if (cnpjBase.length !== 12) return 'Base inválida';

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma1 = 0;
    for (let i = 0; i < 12; i++) soma1 += parseInt(cnpjBase[i]) * pesos1[i];
    let dv1 = 11 - (soma1 % 11);
    dv1 = dv1 >= 10 ? 0 : dv1;

    const cnpj13 = cnpjBase + dv1;
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma2 = 0;
    for (let i = 0; i < 13; i++) soma2 += parseInt(cnpj13[i]) * pesos2[i];
    let dv2 = 11 - (soma2 % 11);
    dv2 = dv2 >= 10 ? 0 : dv2;

    return `${dv1}${dv2}`;
}

// Função para extrair base do CNPJ
function extrairBaseCnpj(cnpj) {
    const cnpjLimpo = String(cnpj).replace(/\D/g, '');
    const base8 = cnpjLimpo.slice(0, 8).padStart(8, '0');
    return `${base8}0001`;
}

// Função para ler e processar o CSV, pegando só o CNPJ e o nome
function lerEmpresasCSV() {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(process.cwd(), 'public', 'empresas.csv');
        const readline = require('readline');
        const stream = fs.createReadStream(filePath);
        const rl = readline.createInterface({ input: stream });

        rl.on('line', (line) => {
            if (!line.trim() || line.startsWith('CNPJ')) return;
            // Divide só nos dois primeiros ";"
            const partes = line.split(';');
            const cnpj = partes[0].replace(/"/g, '');
            const nome = (partes[1] || '').replace(/"/g, '');
            const baseCnpj = extrairBaseCnpj(cnpj);
            const dvCalculado = calcularDvCnpjBase(baseCnpj);
            const cnpjCompleto = baseCnpj + dvCalculado;
            results.push({
                'Nome da empresa': nome,
                'CNPJ': cnpjCompleto,
                'DV': dvCalculado
            });
        });

        rl.on('close', () => resolve(results));
        rl.on('error', reject);
    });
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const termo = (searchParams.get('q') || '').trim().toLowerCase();
    try {
        const empresas = await lerEmpresasCSV();

        let resposta = [];
        if (/^\d+$/.test(termo)) {
            const n = parseInt(termo, 10);
            resposta = empresas.slice(0, n);
        } else {
            resposta = empresas
                .filter(e => (e['Nome da empresa'] || '').toLowerCase().includes(termo))
                .sort((a, b) => (a['Nome da empresa'] || '').length - (b['Nome da empresa'] || '').length);
        }
        return Response.json(resposta);
    } catch (err) {
        return Response.json({ error: 'Erro ao processar o CSV' }, { status: 500 });
    }
}