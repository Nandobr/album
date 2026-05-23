import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instancia o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables.' }, { status: 500 });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing image payload' }, { status: 400 });
    }

    // Utiliza o modelo gemini-3.1-flash-lite (o modelo ultra rápido mais recente pedido)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
    Você é um especialista em extração de texto de figurinhas da Panini (Copa do Mundo 2026).
    Nesta imagem há várias figurinhas. Preciso que você encontre o código exato impresso no canto superior direito do verso de cada figurinha.
    Esses códigos geralmente seguem o padrão de 3 letras maiúsculas seguidas de um número (ex: POR 12, ENG 6, GER 2). 
    Para as figurinhas da Coca-Cola, as letras são 'CC' (ex: CC3, CC4).
    Para as do mundial, as letras são 'FWC' (ex: FWC 18).
    
    Por favor, retorne os códigos que você encontrar estritamente no seguinte formato de lista, agrupando pelo time:
    POR: 5, 8, 9, 12
    ENG: 5, 6, 12, 14
    GER: 2, 11, 14
    USA: 4
    CC: 3, 4, 5
    
    Não escreva mais nada além da lista formatada.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
