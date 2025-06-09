"use client";
import React, { useState } from "react";

export default function Home() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1
        }}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>
      <App />
    </>
  );
}

function App() {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [quantidade, setQuantidade] = useState('');
  const [buscou, setBuscou] = useState()

  const handleBuscar = async () => {
    if (!busca.trim()) return;
    setCarregando(true);
    try {
      const resposta = await fetch(`http://localhost:5006/buscar?q=${encodeURIComponent(busca)}`);
      if (!resposta.ok) throw new Error('Resultado não encontrado');
      const dados = await resposta.json();
      setResultados(dados);
    } catch (error) {
      console.error('Erro:', error);
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

  return (
    <div id='introdução'>
      <h1>FLUXO</h1>
      <h3>ache seu numero verificador, com apenas um click</h3>
      <div className='procura'>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyPress={handleKeyPress}
          name='nome'
          className='nomeem'
          placeholder='Digite o nome da empresa'
        />
        <input
          type="number"
          name="quantidade"
          className="abc"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
        />
        <button onClick={handleBuscar} disabled={carregando}>
          {carregando ? 'Buscando...' : 'Enviar'}
        </button>
      </div>
      <div className="procura">
        {resultados.length > 0 ? (
          <ul className='resultados'>
            {resultados.map((item, index) => (
              <li key={index} className='resultado-item'>
                <h3>{item['Nome da empresa']}</h3>
                <p>{item['CNPJ']}</p>
              </li>
            ))}
          </ul>
        ) : (
          buscou && <p className='sem-resultados'>Nenhum resultado encontrado</p>
        )}
      </div>
    </div>
  );
}
