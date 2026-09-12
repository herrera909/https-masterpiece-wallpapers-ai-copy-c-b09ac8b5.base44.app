import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const STYLES = ["cinematic", "cyberpunk", "fantasy", "minimal", "abstract", "anime"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 300) : '';
    const style = STYLES.includes(body.style) ? body.style : 'cinematic';
    if (!prompt) return Response.json({ error: 'Prompt is required' }, { status: 400 });

    const fullPrompt = `A stunning vertical phone wallpaper, ${style} style: ${prompt}. Ultra detailed, cinematic lighting, high contrast, atmospheric, 9:16 composition.`;
    const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: fullPrompt });
    const image_url = result.file_url || result.url;
    if (!image_url) throw new Error('Image generation returned no image');
    return Response.json({ image_url, style });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}