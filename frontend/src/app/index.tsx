import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated, getCurrentUserRole, getCurrentUserEmail } from '../services/auth';
import { showAlert } from '../utils/alert';

export default function LandingPage() {
  const router = useRouter();

  // Estados de autenticação
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState('ATHLETE');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Estados de acessibilidade
  const [highContrast, setHighContrast] = useState(false);

  // Modais interativos
  const [modalAluno, setModalAluno] = useState(false);
  const [modalVoluntario, setModalVoluntario] = useState(false);
  const [modalDoacao, setModalDoacao] = useState(false);

  // Formulário de Aluno
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoDeficiencia, setAlunoDeficiencia] = useState('');
  const [alunoWhats, setAlunoWhats] = useState('');
  const [alunoIdade, setAlunoIdade] = useState('');

  // Formulário de Voluntário
  const [voluntarioNome, setVoluntarioNome] = useState('');
  const [voluntarioArea, setVoluntarioArea] = useState('Fisioterapia / Terapia Ocupacional');
  const [voluntarioTel, setVoluntarioTel] = useState('');

  useEffect(() => {
    isAuthenticated().then((auth) => {
      setIsLogged(auth);
      if (auth) {
        getCurrentUserRole().then(setUserRole);
        getCurrentUserEmail().then(setUserEmail);
      }
    });
  }, []);

  const copiarPix = () => {
    const pix = '42.180.932/0001-85';
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pix);
    }
    showAlert('Chave PIX Copiada!', 'Chave CNPJ: ' + pix + '\nCole no app do seu banco.');
  };

  const handleSubmeterAluno = () => {
    if (!alunoNome || !alunoWhats) {
      showAlert('Atenção', 'Por favor, preencha seu nome e contato.');
      return;
    }
    setModalAluno(false);
    showAlert(
      'Inscrição Enviada! 🛶',
      'Obrigado, ' + alunoNome + '! Nossa equipe de saúde entrará em contato pelo WhatsApp para agendar sua avaliação funcional gratuita.'
    );
    setAlunoNome('');
    setAlunoDeficiencia('');
    setAlunoWhats('');
    setAlunoIdade('');
  };

  const handleSubmeterVoluntario = () => {
    if (!voluntarioNome || !voluntarioTel) {
      showAlert('Atenção', 'Por favor, informe seu nome e telefone.');
      return;
    }
    setModalVoluntario(false);
    showAlert(
      'Cadastro de Voluntário Recebido! 🤝',
      'Obrigado pelo seu compromisso com a inclusão! Entraremos em contato com detalhes da próxima capacitação de praia.'
    );
    setVoluntarioNome('');
    setVoluntarioTel('');
  };

  return (
    <View className={`flex-1 ${highContrast ? 'bg-black text-white' : 'bg-surface text-on-surface'} font-sans`}>
      {/* 0. BARRA DE ACESSIBILIDADE CIDADÃ (WCAG 2.1 AA) */}
      <View className="bg-surface-container-low border-b border-outline-variant/30 px-4 py-2">
        <View className="max-w-7xl mx-auto flex-row items-center justify-between w-full">
          <Text className="text-xs text-on-surface-variant font-medium">
            Acessibilidade Cidadã WCAG 2.1 AA
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setHighContrast(!highContrast)}
              className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-surface-container"
            >
              <Text className="text-xs font-semibold text-primary">
                {highContrast ? 'Modo Padrão' : 'Alto Contraste'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showAlert('VLibras', 'Recurso de tradução em Língua Brasileira de Sinais ativado para este portal.')}
              className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-surface-container"
            >
              <Text className="text-xs font-semibold text-primary">VLibras</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 1. HEADER / NAVBAR PRINCIPAL */}
      <View className="bg-surface/95 border-b border-outline-variant/20 px-4 sm:px-8 py-3.5 z-40 sticky top-0">
        <View className="max-w-7xl mx-auto flex-row items-center justify-between w-full">
          {/* Marca e Logo */}
          <TouchableOpacity onPress={() => router.push('/')} className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm">
              <Text className="text-xl">🛶</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-primary tracking-tight">Canoa Para Todos</Text>
              <Text className="text-xs text-on-surface-variant leading-none">Inclusão sobre as águas</Text>
            </View>
          </TouchableOpacity>

          {/* Links Centrais de Navegação Desktop (Stitch) */}
          <View className="hidden xl:flex flex-row items-center gap-1">
            <TouchableOpacity onPress={() => router.push('/')} className="px-3 py-1.5 rounded-lg bg-surface-container">
              <Text className="text-sm font-bold text-on-surface">Início</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showAlert('O Projeto', 'O Projeto Canoa Para Todos promove inclusão social, fisioterapia motora e vivências no mar de forma 100% gratuita.')} className="px-3 py-1.5 rounded-lg">
              <Text className="text-sm text-on-surface-variant font-medium">O Projeto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showAlert('Como Funciona', 'Atendemos com esteiras de praia acessíveis, cadeiras anfíbias, coletes homologados pela Marinha e canoas OC6 com assentos adaptados.')} className="px-3 py-1.5 rounded-lg">
              <Text className="text-sm text-on-surface-variant font-medium">Como Funciona</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showAlert('Impacto & Histórias', 'Confira o depoimento da atleta Camila Meireles e nossos indicadores de impacto logo abaixo.')} className="px-3 py-1.5 rounded-lg">
              <Text className="text-sm text-on-surface-variant font-medium">Impacto & Histórias</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalDoacao(true)} className="px-3 py-1.5 rounded-lg">
              <Text className="text-sm text-on-surface-variant font-medium">Como Apoiar</Text>
            </TouchableOpacity>
          </View>

          {/* Ações / Login */}
          <View className="flex-row items-center gap-3">
            {isLogged ? (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                className="px-4 py-2 rounded-xl bg-primary text-white shadow-sm flex-row items-center gap-2"
              >
                <Text className="text-white font-semibold text-sm">Ir para o Calendário</Text>
                <Text className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {userRole}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/login')}
                className="px-4 py-2 rounded-xl border border-primary/30 text-primary"
              >
                <Text className="text-primary font-bold text-sm">Entrar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setModalDoacao(true)}
              className="px-4 py-2 rounded-xl bg-tertiary-container text-white shadow-sm"
            >
              <Text className="text-white font-bold text-sm">Quero Apoiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL ROLÁVEL */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 2. HERO SECTION */}
        <View className="w-full px-4 sm:px-8 pt-6 lg:pt-10 pb-16 bg-gradient-to-b from-surface via-surface-container-low/40 to-background">
          <View className="w-full max-w-7xl mx-auto flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Coluna de Texto do Hero */}
            <View className="flex-1 w-full lg:max-w-[580px] flex-col items-start z-10">
              <View className="inline-flex flex-row items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/30 text-on-secondary-container mb-6 shadow-sm">
                <Text className="text-secondary font-bold text-xs uppercase tracking-wider">
                  🌊 Inclusão Social & Canoagem Adaptada
                </Text>
              </View>

              <Text className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-primary tracking-tight mb-6 leading-tight">
                A água não impõe barreiras.{'\n'}
                <Text className="text-tertiary-container">Ela liberta.</Text>
              </Text>

              <Text className="text-base sm:text-lg text-on-surface-variant mb-8 leading-relaxed">
                Promovemos autonomia, reabilitação motora e conexão oceânica através da canoa polinésia adaptada (Va'a) para pessoas com deficiências físicas, intelectuais e sensoriais. O mar pertence a todos nós.
              </Text>

              {/* Botões de Ação do Hero */}
              <View className="flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <TouchableOpacity
                  onPress={() => setModalAluno(true)}
                  className="px-7 py-4 rounded-xl bg-primary text-white shadow-md flex-row items-center justify-center gap-2 hover:bg-primary-container"
                >
                  <Text className="text-white font-bold text-base">Aulas Gratuitas (Inscrição)</Text>
                  <Text className="text-white font-bold text-base">→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalDoacao(true)}
                  className="px-7 py-4 rounded-xl bg-tertiary-container text-white shadow-md flex-row items-center justify-center gap-2 hover:bg-tertiary"
                >
                  <Text className="text-white text-base">❤️</Text>
                  <Text className="text-white font-bold text-base">Apoiar o Projeto</Text>
                </TouchableOpacity>
              </View>

              {/* Selos de Confiança */}
              <View className="flex-row items-center gap-3 mt-10 text-on-surface-variant text-xs">
                <View className="flex-row -space-x-2">
                  <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center border-2 border-surface">
                    <Text className="text-white text-xs font-bold">V6</Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center border-2 border-surface">
                    <Text className="text-white text-xs font-bold">V1</Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-tertiary items-center justify-center border-2 border-surface">
                    <Text className="text-white text-xs font-bold">CREF</Text>
                  </View>
                </View>
                <Text className="text-on-surface-variant text-xs flex-1 leading-tight">
                  Acompanhamento contínuo por fisioterapeutas, educadores físicos e timoneiros certificados.
                </Text>
              </View>
            </View>

            {/* Coluna Visual do Hero */}
            <View className="flex-1 w-full lg:max-w-[500px] flex-col items-center lg:items-end justify-center relative mt-8 lg:mt-0">
              {/* Moldura da Imagem */}
              <View className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-white p-2.5">
                <View className="relative rounded-2xl overflow-hidden w-full h-[380px] sm:h-[440px]">
                  <Image
                    source={{
                      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGNMJuvOj7qvf34Ta4Ncj6L3pTpZfzLsaWXdhty-YYq2RsWKXRbNbeD1Fsuvoiuld7pZRhzD5xKRIxY9y_3BfNQ1RotIs5Is75JenYF0qFAIHesaHWlKm6Jq_FIAnUQNbafqswiOj9TDI5EDPN2YxZs8ssXGYI-VmdVWuuKgg9uMxLEgjmT1eb3Po33NwTKYBJuZHf-Qk4hsi-LsX4ViKzW73TpT8A63RSzg5Hr57Pqo5ogyeNmHMM7w',
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  {/* Badge Flutuante Interno Superior: Segurança Total */}
                  <View className="absolute top-4 right-4 bg-white/95 rounded-2xl p-3 shadow-md flex-row items-center gap-2.5 hidden sm:flex">
                    <View className="w-8 h-8 rounded-xl bg-tertiary-fixed/50 items-center justify-center">
                      <Text className="text-base">🛡️</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-on-surface text-xs leading-tight">Segurança Total</Text>
                      <Text className="text-[11px] text-on-surface-variant">Colete & Apoio náutico</Text>
                    </View>
                  </View>

                  {/* Badge Flutuante Interno Inferior: 100% Gratuito */}
                  <View className="absolute bottom-4 left-4 bg-white/95 rounded-2xl p-3 shadow-md flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-secondary-container/40 items-center justify-center">
                      <Text className="text-xl">🎗️</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-primary text-sm leading-none">100% Gratuito</Text>
                      <Text className="text-xs text-on-surface-variant mt-0.5">Para pessoas com deficiência</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. BENTO METRICS GRID (NÚMEROS DE IMPACTO) */}
        <View className="py-12 bg-surface-container-low px-4 sm:px-8">
          <View className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Métrica 1 */}
            <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <Text className="text-3xl sm:text-4xl font-extrabold text-primary">+350</Text>
              <Text className="text-base font-bold text-on-surface mt-1">Alunos Atendidos</Text>
              <Text className="text-xs text-on-surface-variant mt-2">
                Crianças, jovens e adultos com lesão medular, amputações e neurodivergências.
              </Text>
            </View>

            {/* Métrica 2 */}
            <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <Text className="text-3xl sm:text-4xl font-extrabold text-secondary">+1.800</Text>
              <Text className="text-base font-bold text-on-surface mt-1">Vivências Náuticas</Text>
              <Text className="text-xs text-on-surface-variant mt-2">
                Expedições no mar, treinos técnicos e imersões de bem-estar ao longo da orla.
              </Text>
            </View>

            {/* Métrica 3 */}
            <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <Text className="text-3xl sm:text-4xl font-extrabold text-tertiary-container">+60</Text>
              <Text className="text-base font-bold text-on-surface mt-1">Voluntários Ativos</Text>
              <Text className="text-xs text-on-surface-variant mt-2">
                Fisioterapeutas, remadores experientes, resgatistas e equipe de acolhimento.
              </Text>
            </View>

            {/* Métrica 4 */}
            <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <Text className="text-3xl sm:text-4xl font-extrabold text-primary-container">0 R$</Text>
              <Text className="text-base font-bold text-on-surface mt-1">Custo ao Aluno</Text>
              <Text className="text-xs text-on-surface-variant mt-2">
                Financiado integralmente por doadores, parceiros e editais sociais.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. TRÊS PILARES DE TRANSFORMAÇÃO HUMANA */}
        <View className="py-16 px-4 sm:px-8 bg-background">
          <View className="max-w-7xl mx-auto">
            <View className="items-center text-center max-w-2xl mx-auto mb-12">
              <Text className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Nossa Metodologia
              </Text>
              <Text className="text-2xl sm:text-3xl font-bold text-primary">
                Três Pilares de Transformação Humana
              </Text>
              <Text className="text-sm sm:text-base text-on-surface-variant mt-3 text-center">
                A canoa havaiana não é apenas um esporte; é um catalisador de saúde mental, fortalecimento funcional e redes de apoio comunitário.
              </Text>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pilar 1 */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
                <View className="w-12 h-12 rounded-2xl bg-primary-fixed items-center justify-center mb-4">
                  <Text className="text-2xl">💪</Text>
                </View>
                <Text className="text-lg font-bold text-on-surface mb-2">Reabilitação & Fisioterapia</Text>
                <Text className="text-sm text-on-surface-variant leading-relaxed">
                  A cadência da remada desenvolve tonificação do tronco, fortalecimento de cintura escapular e melhora na capacidade cardiorrespiratória. A água atua no alívio de tônus espástico.
                </Text>
                <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Text className="text-xs font-semibold text-primary">✓ Avaliação motora individualizada</Text>
                </View>
              </View>

              {/* Pilar 2 */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
                <View className="w-12 h-12 rounded-2xl bg-secondary-fixed items-center justify-center mb-4">
                  <Text className="text-2xl">🤝</Text>
                </View>
                <Text className="text-lg font-bold text-on-surface mb-2">Espírito de Equipe (Ohana)</Text>
                <Text className="text-sm text-on-surface-variant leading-relaxed">
                  Em uma canoa V6, todos remam na mesma pulsação. A individualidade soma-se ao coletivo: sem hierarquias, sem preconceitos. Laços duradouros de companheirismo e pertencimento.
                </Text>
                <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Text className="text-xs font-semibold text-secondary">✓ Sincronia, empatia e escuta ativa</Text>
                </View>
              </View>

              {/* Pilar 3 */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
                <View className="w-12 h-12 rounded-2xl bg-tertiary-fixed items-center justify-center mb-4">
                  <Text className="text-2xl">♿</Text>
                </View>
                <Text className="text-lg font-bold text-on-surface mb-2">Acessibilidade & Cidadania</Text>
                <Text className="text-sm text-on-surface-variant leading-relaxed">
                  Criamos esteiras rígidas de acesso na areia, cadeiras de transição anfíbias e bancos anatômicos com apoios de postura para garantir o direito pleno e seguro à orla marítima.
                </Text>
                <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Text className="text-xs font-semibold text-tertiary-container">✓ Acesso da calçada às ondas</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 5. A JORNADA DO ALUNO NA ÁGUA (4 PASSOS) */}
        <View className="py-16 px-4 sm:px-8 bg-surface-container-low/70">
          <View className="max-w-7xl mx-auto">
            <View className="mb-10">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Passo a Passo Seguro
              </Text>
              <Text className="text-2xl sm:text-3xl font-bold text-on-surface">
                A Jornada do Aluno na Água
              </Text>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Passo 01 */}
              <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <Text className="text-3xl font-black text-primary mb-2">01</Text>
                <Text className="text-base font-bold text-primary mb-1">Acolhimento & Avaliação</Text>
                <Text className="text-xs text-on-surface-variant leading-relaxed">
                  Entrevista com fisioterapeutas para mapear mobilidade, histórico médico, equilíbrio e objetivos esportivos.
                </Text>
              </View>

              {/* Passo 02 */}
              <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <Text className="text-3xl font-black text-secondary mb-2">02</Text>
                <Text className="text-base font-bold text-secondary mb-1">Ajuste de Equipamentos</Text>
                <Text className="text-xs text-on-surface-variant leading-relaxed">
                  Personalização de assentos com densidade ortopédica, faixas torácicas e grips adaptados para as mãos.
                </Text>
              </View>

              {/* Passo 03 */}
              <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <Text className="text-3xl font-black text-tertiary-container mb-2">03</Text>
                <Text className="text-base font-bold text-tertiary-container mb-1">Simulação na Areia</Text>
                <Text className="text-xs text-on-surface-variant leading-relaxed">
                  Treino em terra firme com comandos de voz, sincronismo de pá, rotação de tronco e respiração.
                </Text>
              </View>

              {/* Passo 04 */}
              <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <Text className="text-3xl font-black text-primary-container mb-2">04</Text>
                <Text className="text-base font-bold text-primary-container mb-1">Remada no Oceano</Text>
                <Text className="text-xs text-on-surface-variant leading-relaxed">
                  Embarque assistido até a canoa, guiados por timoneiro experiente e barco de apoio náutico dedicado.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. DEPOIMENTO DE IMPACTO (CAMILA MEIRELES) */}
        <View className="py-16 px-4 sm:px-8 bg-background">
          <View className="max-w-7xl mx-auto">
            <View className="bg-primary rounded-3xl p-8 sm:p-12 text-white shadow-xl flex-col lg:flex-row items-center gap-8">
              {/* Foto da Atleta */}
              <View className="items-center lg:items-start text-center lg:text-left">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsfWjsCUnq7TZCHzgdkWhrCdur3NyFq6HHgAi7yBLnF6nbxiQ5nhEjlKCXeZjFttk44PblD8yA3q5cgAL0o-D8WAG9TUfw6kFHMen2lvgTX0XhbDByNF6Wk1eLWa4X67C8Kljn6A5lCiJUSp5j7dc7KNZehuM0HozABQOlaKGYZ9NCR0lxe6um0kvZ1QTriPbb4GaZ3IJnaeGTLWw1MpnGzAR_C7IfoasC8eIvLR922pYsr6gzZPOpyQ',
                  }}
                  className="w-36 h-36 rounded-full border-4 border-white/20 mb-3"
                  resizeMode="cover"
                />
                <Text className="text-xl font-bold text-white">Camila Meireles, 28</Text>
                <Text className="text-xs text-primary-fixed">Paratleta de Va'a e Aluna do Projeto</Text>
                <View className="mt-2 bg-white/10 px-3 py-1 rounded-full">
                  <Text className="text-xs text-secondary-fixed font-semibold">🏆 Campeã Estadual Paradesportiva</Text>
                </View>
              </View>

              {/* Citação */}
              <View className="flex-1">
                <Text className="text-4xl text-secondary-fixed opacity-70 mb-2">“</Text>
                <Text className="text-lg sm:text-2xl font-bold leading-relaxed text-white tracking-tight">
                  Quando estou na cadeira de rodas, vejo escadas, buracos e olhares de pena. Quando entro na canoa, vejo horizonte aberto. O remo me deu costas fortes e uma mente inabalável. A água nos torna iguais.
                </Text>
                <View className="flex-row flex-wrap gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-primary-fixed">
                  <Text className="text-xs text-primary-fixed">⏱️ Treina há 3 anos no projeto</Text>
                  <Text className="text-xs text-primary-fixed">🛶 Remadas semanais de 8km</Text>
                  <Text className="text-xs text-primary-fixed">🧠 Autonomia e independência recuperadas</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 7. CANAIS DE PARTICIPAÇÃO DIRETA (3 CARDS) */}
        <View className="py-16 px-4 sm:px-8 bg-surface-container-low">
          <View className="max-w-7xl mx-auto">
            <View className="items-center text-center max-w-2xl mx-auto mb-12">
              <Text className="text-xs font-bold uppercase tracking-wider text-tertiary-container mb-2">
                Faça Parte da Remada
              </Text>
              <Text className="text-2xl sm:text-3xl font-bold text-primary">
                Canais de Participação Direta
              </Text>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Aluno */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm flex-col justify-between">
                <View>
                  <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center text-white mb-4">
                    <Text className="text-2xl">🛶</Text>
                  </View>
                  <Text className="text-lg font-bold text-on-surface mb-2">Quero ser Aluno</Text>
                  <Text className="text-xs text-on-surface-variant mb-4">
                    Inscrições gratuitas e contínuas para pessoas com deficiência física, visual ou mobilidade reduzida.
                  </Text>
                  <View className="gap-2 mb-6">
                    <Text className="text-xs text-primary font-medium">✓ Não precisa saber nadar</Text>
                    <Text className="text-xs text-primary font-medium">✓ Equipamentos adaptados fornecidos</Text>
                    <Text className="text-xs text-primary font-medium">✓ Acompanhante pode assistir na praia</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setModalAluno(true)}
                  className="w-full py-3.5 rounded-xl bg-primary items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-sm">Cadastrar como Aluno</Text>
                </TouchableOpacity>
              </View>

              {/* Card 2: Voluntário */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm flex-col justify-between">
                <View>
                  <View className="w-12 h-12 rounded-2xl bg-secondary items-center justify-center text-white mb-4">
                    <Text className="text-2xl">🙌</Text>
                  </View>
                  <Text className="text-lg font-bold text-on-surface mb-2">Quero ser Voluntário</Text>
                  <Text className="text-xs text-on-surface-variant mb-4">
                    Precisamos de remadores, fisioterapeutas, fotógrafos e pessoas para apoio de terra e acolhimento.
                  </Text>
                  <View className="gap-2 mb-6">
                    <Text className="text-xs text-secondary font-medium">✓ Treinamento fornecido pela ONG</Text>
                    <Text className="text-xs text-secondary font-medium">✓ Certificado de horas complementares</Text>
                    <Text className="text-xs text-secondary font-medium">✓ Escala flexível de fins de semana</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVoluntario(true)}
                  className="w-full py-3.5 rounded-xl bg-secondary items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-sm">Quero Ser Voluntário</Text>
                </TouchableOpacity>
              </View>

              {/* Card 3: Doação PIX */}
              <View className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm flex-col justify-between relative overflow-hidden">
                <View>
                  <View className="w-12 h-12 rounded-2xl bg-tertiary-container items-center justify-center text-white mb-4">
                    <Text className="text-2xl">🪙</Text>
                  </View>
                  <Text className="text-lg font-bold text-on-surface mb-2">Apoio Financeiro & PIX</Text>
                  <Text className="text-xs text-on-surface-variant mb-4">
                    Sua doação compra coletes especiais, esteiras acessíveis para cadeirantes e transporte adaptado.
                  </Text>
                  <View className="p-3 rounded-xl bg-surface-container-low mb-4">
                    <Text className="text-xs text-on-surface-variant mb-1 font-semibold">Chave PIX (CNPJ):</Text>
                    <Text className="text-xs font-mono font-bold text-tertiary-container">42.180.932/0001-85</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setModalDoacao(true)}
                  className="w-full py-3.5 rounded-xl bg-tertiary-container items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-sm">Doar Agora (PIX)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 8. MOSAICO COMUNITÁRIO DO INSTAGRAM (@canoaparatodos) */}
        <View className="py-16 px-4 sm:px-8 bg-background">
          <View className="max-w-7xl mx-auto">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Comunidade & Bastidores
                </Text>
                <Text className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
                  Siga @canoaparatodos
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => showAlert('Instagram', 'Acesse nosso perfil @canoaparatodos nas redes sociais.')}
                className="px-4 py-2 rounded-xl bg-surface-container"
              >
                <Text className="text-xs font-semibold text-primary">Ver no Instagram</Text>
              </TouchableOpacity>
            </View>

            <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk1A4fIIjvn3Dh3hhMooSFGbyo6XR2RnOuj4wNhT_8r8ClzXb4-U3xmzK3vlcjKuDrIiawguDGgZI4I7DS6KOnZg3vQ5PuRIsx98Ju3yQ_cN9iJjTGgQYv2S1afGFy4jFxFIshVKTaYMF4w9Fn8ucwJiEfScipfYqDUcbqpp-RK44SWXhav0k4lY86m4TvoDPOMbUcpOuAWIT6Adg7jdnvXr_wezgrUVtR43vn38a34jZSZ97Mms4ATw',
                }}
                className="w-full h-44 rounded-2xl shadow-sm"
                resizeMode="cover"
              />
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt_DTRpG8IOGOL-aDsaGaHiJpOWcG_n4cCbHyeUpfTaRXUFyQ9MJy-PsZq5i2YJNxzn-kluibgsFzCE2mxkyQvOFeML49p_xyGrUDc6TIZU4ltijlXAyI1OZY0W4Px4Hcil2L6_FsnVO1EL-JAPedMEQgBDC5WCoBJVKL2xOLygFmqF7T1cpksNDHhb42-4HiTp-e6INZ3H6c_IprZgdVtSkdtYpC7wjWZaRULVxE3Nwaloaf8AZqU2w',
                }}
                className="w-full h-44 rounded-2xl shadow-sm"
                resizeMode="cover"
              />
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABPL8CLJBBudx5kYf6pgqD3RhHM3-9k7Ju5w1-p5Pu1PMF9djBt1ktkW2pWdXxJOXChlGCVBNUvjv89NWbUXoQLbR2FLDsgFC7D6l__x638P-fo0oJyE5RwjN_07_J34cphu2GEslLKOIIu8UC_RH4519sUI7XQSFi7vqD1kCL36lJ5jAzOoYH96cBC11-fqv5lu_gyD-LKKXDU_reI4OHbFHwVlWrEWIn_1fHAbaocNTFIUqvg1XT1w',
                }}
                className="w-full h-44 rounded-2xl shadow-sm"
                resizeMode="cover"
              />
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6KTA1MkGpDUSjLMtcHuUuo11GbP69Sv9QzOijZyFUv7PRTUh0jKLgZ3fTtkTxIgkWZ2Wu9Ve5VWUOVyyPBDBD6tuOqq0X9d_FlEjMgbbTmFBdr91Qq2jGnijSddo2tuiap2-IniRBbvrEi3H2ZjYk2HDVOzNecpUaYJ5emoFugQ6ZSzV9ZGl8mnMbRrkBn8bCT21CAEf98deqcSBDkFRp1ob-k7bKOIwo9zC2JbvScvxrtVP6ceNu1g',
                }}
                className="w-full h-44 rounded-2xl shadow-sm"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* 9. RODAPÉ INSTITUCIONAL */}
        <View className="bg-surface-container-low px-4 sm:px-8 py-12 border-t border-outline-variant/30">
          <View className="max-w-7xl mx-auto flex-col md:flex-row justify-between gap-8">
            {/* Info Institucional */}
            <View className="max-w-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">🛶</Text>
                <Text className="text-lg font-bold text-primary">Projeto Canoa Para Todos</Text>
              </View>
              <Text className="text-xs text-on-surface-variant leading-relaxed mb-3">
                Promovendo emancipação motora, acolhimento social e conexão náutica através da canoagem polinésia (Va'a) 100% adaptada para pessoas com deficiência.
              </Text>
              <Text className="text-xs text-on-surface-variant">CNPJ: 42.180.932/0001-85</Text>
              <Text className="text-xs text-on-surface-variant">Sede Náutica: Praia do Canto • Vitória - ES</Text>
            </View>

            {/* Links Rápidos */}
            <View className="flex-row gap-12">
              <View>
                <Text className="font-bold text-sm text-on-surface mb-2">Navegação</Text>
                <TouchableOpacity onPress={() => router.push('/login')} className="mb-1">
                  <Text className="text-xs text-on-surface-variant">Acesso ao Sistema</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalAluno(true)} className="mb-1">
                  <Text className="text-xs text-on-surface-variant">Inscrição de Aluno</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVoluntario(true)} className="mb-1">
                  <Text className="text-xs text-on-surface-variant">Seja Voluntário</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="font-bold text-sm text-on-surface mb-2">Transparência</Text>
                <Text className="text-xs text-on-surface-variant mb-1">Prestação de Contas</Text>
                <Text className="text-xs text-on-surface-variant mb-1">Termos de Uso</Text>
                <View className="mt-2 bg-surface-container px-2 py-1 rounded">
                  <Text className="text-xs text-primary font-semibold">Selo WCAG 2.1 AAA Ready</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="max-w-7xl mx-auto mt-8 pt-4 border-t border-outline-variant/20 flex-row justify-between">
            <Text className="text-xs text-on-surface-variant">© 2026 Projeto Canoa Para Todos. Todos os direitos reservados.</Text>
            <Text className="text-xs text-on-surface-variant">Remando juntos rumo à acessibilidade universal.</Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: INSCRIÇÃO DE ALUNO */}
      <Modal visible={modalAluno} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🛶</Text>
                <Text className="text-lg font-bold text-primary">Inscrição de Aluno</Text>
              </View>
              <TouchableOpacity onPress={() => setModalAluno(false)}>
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-on-surface-variant mb-4">
              Atendimento 100% gratuito. Preencha seus dados para agendarmos sua avaliação na praia:
            </Text>

            <View className="gap-3 mb-6">
              <View>
                <Text className="text-xs font-semibold mb-1">Nome Completo</Text>
                <TextInput
                  value={alunoNome}
                  onChangeText={setAlunoNome}
                  placeholder="Ex: Gabriel Soares"
                  className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold mb-1">Tipo de Deficiência / Necessidade</Text>
                <TextInput
                  value={alunoDeficiencia}
                  onChangeText={setAlunoDeficiencia}
                  placeholder="Ex: Cadeirante, mobilidade reduzida, etc."
                  className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold mb-1">WhatsApp</Text>
                  <TextInput
                    value={alunoWhats}
                    onChangeText={setAlunoWhats}
                    placeholder="(27) 99999-9999"
                    keyboardType="phone-pad"
                    className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                  />
                </View>
                <View className="w-24">
                  <Text className="text-xs font-semibold mb-1">Idade</Text>
                  <TextInput
                    value={alunoIdade}
                    onChangeText={setAlunoIdade}
                    placeholder="Ex: 24"
                    keyboardType="number-pad"
                    className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmeterAluno}
              className="w-full py-3.5 rounded-xl bg-primary items-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm">Confirmar Pré-Inscrição</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: VOLUNTÁRIO */}
      <Modal visible={modalVoluntario} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🤝</Text>
                <Text className="text-lg font-bold text-secondary">Seja Voluntário</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVoluntario(false)}>
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-on-surface-variant mb-4">
              Junte-se à tripulação! Oportunidades com capacitação e certificado de horas:
            </Text>

            <View className="gap-3 mb-6">
              <View>
                <Text className="text-xs font-semibold mb-1">Seu Nome</Text>
                <TextInput
                  value={voluntarioNome}
                  onChangeText={setVoluntarioNome}
                  placeholder="Digite seu nome completo"
                  className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold mb-1">Área de Atuação</Text>
                <TextInput
                  value={voluntarioArea}
                  onChangeText={setVoluntarioArea}
                  placeholder="Fisioterapia, Apoio de Praia, etc."
                  className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold mb-1">Telefone / WhatsApp</Text>
                <TextInput
                  value={voluntarioTel}
                  onChangeText={setVoluntarioTel}
                  placeholder="(27) 99999-9999"
                  keyboardType="phone-pad"
                  className="w-full bg-surface-container-low p-3 rounded-xl text-sm"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmeterVoluntario}
              className="w-full py-3.5 rounded-xl bg-secondary items-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm">Enviar Cadastro de Voluntário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: DOAÇÃO PIX */}
      <Modal visible={modalDoacao} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">❤️</Text>
                <Text className="text-lg font-bold text-tertiary-container">Apoio Financeiro & PIX</Text>
              </View>
              <TouchableOpacity onPress={() => setModalDoacao(false)}>
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-on-surface-variant mb-4">
              Cada contribuição garante coletes adaptados, esteiras de acessibilidade e combustível para o barco de apoio náutico.
            </Text>

            <View className="p-4 rounded-2xl bg-surface-container-low mb-6 border border-tertiary-fixed">
              <Text className="text-xs font-bold text-tertiary-container uppercase mb-1">Chave PIX Oficial (CNPJ):</Text>
              <View className="flex-row items-center justify-between bg-surface-container-lowest p-3 rounded-xl">
                <Text className="font-mono font-bold text-sm text-primary flex-1">42.180.932/0001-85</Text>
                <TouchableOpacity onPress={copiarPix} className="px-3 py-1.5 rounded-lg bg-primary text-white">
                  <Text className="text-white font-bold text-xs">Copiar</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-on-surface-variant mt-2">
                Favorecido: Associação Projeto Canoa Para Todos
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-xs font-semibold mb-2">Valores Sugeridos de Apoio Mensal:</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={copiarPix} className="flex-1 py-2.5 rounded-xl bg-surface-container-low items-center">
                  <Text className="font-bold text-primary text-sm">R$ 30</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={copiarPix} className="flex-1 py-2.5 rounded-xl bg-surface-container-low items-center">
                  <Text className="font-bold text-primary text-sm">R$ 60</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={copiarPix} className="flex-1 py-2.5 rounded-xl bg-surface-container-low items-center">
                  <Text className="font-bold text-primary text-sm">R$ 120</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalDoacao(false)}
              className="w-full py-3.5 rounded-xl bg-surface-container-high items-center"
            >
              <Text className="text-on-surface font-bold text-sm">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
