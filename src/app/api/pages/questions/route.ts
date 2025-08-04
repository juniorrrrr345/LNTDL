import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';

export async function GET() {
  try {
    await connectDB();
    
    let page = await Page.findOne({ slug: 'questions' });
    
    if (!page) {
      // Créer la page par défaut si elle n'existe pas
      page = await Page.create({
        slug: 'questions',
        title: 'Questions fréquemment posées',
        content: 'Bienvenue sur notre page de questions fréquemment posées.\n\nN\'hésitez pas à nous contacter si vous avez d\'autres questions.'
      });
    }
    
    return NextResponse.json({
      title: page.title,
      content: page.content
    });
  } catch (error) {
    console.error('Erreur GET page questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la page' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { title, content } = await request.json();
    
    const page = await Page.findOneAndUpdate(
      { slug: 'questions' },
      { title, content },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      page: {
        title: page.title,
        content: page.content
      }
    });
  } catch (error) {
    console.error('Erreur POST page questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}