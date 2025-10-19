import { randomLatency, shouldSimulateError, sleep } from '@/utils/storage';

class MockAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async iniciarGravacao(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw { status: 400, message: 'Erro ao acessar microfone. Verifique as permissões.' };
    }
  }

  async pararGravacao(): Promise<string> {
    await randomLatency();

    if (!this.mediaRecorder) {
      throw { status: 400, message: 'Gravação não iniciada' };
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Parar todas as tracks
        this.mediaRecorder!.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioUrl);
      };

      this.mediaRecorder!.onerror = () => {
        reject({ status: 500, message: 'Erro ao processar gravação' });
      };

      this.mediaRecorder!.stop();
    });
  }

  async transcrever(audioUrl: string): Promise<string> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao transcrever áudio' };

    // Simular transcrição (STT mock)
    await sleep(1000);

    const transcricoesMock = [
      'Gostaria de saber como proceder em caso de furto em estabelecimento comercial.',
      'Como devo agir em uma situação de violência doméstica com vítima menor de idade?',
      'Qual o procedimento correto para abordagem de suspeito em via pública?',
      'Preciso saber sobre preservação de local de crime com vítima fatal.',
    ];

    return transcricoesMock[Math.floor(Math.random() * transcricoesMock.length)];
  }

  async sintetizar(texto: string): Promise<string> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao sintetizar áudio' };

    // Simular síntese de voz (TTS mock)
    await sleep(500);

    // Usar Web Speech API se disponível, senão retornar URL fake
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    // Retornar URL fake para o áudio
    return `data:audio/mp3;base64,fake-audio-${Date.now()}`;
  }

  pararSintese(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  estaSintetizando(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }
}

export const mockAudioService = new MockAudioService();
