/**
 * Utilitário de Ativação do VLibras (Widget Oficial do Governo Federal)
 * Responsável por injetar o elemento no DOM web e instanciar o avatar 3D.
 */
import { Platform } from 'react-native';

export function toggleVLibras(): boolean {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return false;
  }

  const existingScript = document.getElementById('vlibras-script');

  if (!existingScript) {
    // 1. Cria o container do VLibras
    const vlibrasContainer = document.createElement('div');
    vlibrasContainer.setAttribute('vw', '');
    vlibrasContainer.className = 'enabled';
    vlibrasContainer.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(vlibrasContainer);

    // 2. Cria e anexa a tag de script oficial
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      try {
        if ((window as any).VLibras) {
          new (window as any).VLibras.Widget('https://vlibras.gov.br/app');
          // Aguarda renderizar o DOM do plugin e clica no botão de acesso
          setTimeout(() => {
            const btn = document.querySelector('[vw-access-button]') as HTMLElement;
            if (btn) {
              btn.click();
            }
          }, 800);
        }
      } catch (err) {
        console.warn('Erro ao inicializar VLibras Widget:', err);
      }
    };
    document.body.appendChild(script);
    return true;
  } else {
    // Se o script já foi carregado, abre/fecha a janela do avatar 3D
    const btn = document.querySelector('[vw-access-button]') as HTMLElement;
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }
}
