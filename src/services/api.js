import axios from 'axios';

const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Generate social media content from a source URL.
 * 
 * Request schema:
 * { "url": "https://example.com/article" }
 * 
 * Response schema:
 * {
 *   "linkedin": "generated linkedin content",
 *   "telegram": "generated telegram content",
 *   "hashtags": ["#AI", "#Tech"],
 *   "image": "https://example.com/image.jpg"
 * }
 */
export const generateSocialContent = async (url) => {
  // If the endpoint is not defined or is placeholder, we use mock generation for demo flow
  const isDemoUrl = !N8N_URL || N8N_URL.includes('YOUR-N8N-URL') || N8N_URL.includes('your-n8n-url-placeholder');
  
  if (isDemoUrl) {
    console.warn(`n8n webhook URL is not configured. Simulating API response for url: ${url}`);
    
    // Simulate 3 seconds network delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    return {
      linkedin: `🚀 AI is transforming the landscape of social media automation! \n\nI just read an insightful article discussing the integration of automated workflows with advanced language models like Groq and LLMs. The future is here, enabling real-time content distillation and scheduling in seconds.\n\nRead the full piece here: ${url}\n\nWhat are your thoughts on this AI shift? Let me know in the comments below! 👇`,
      telegram: `🤖 *AI Social Automation is Here!*\n\nWe just analyzed a new article about using n8n and LLMs to automate social media channels.\n\n🔗 *Full Article:* ${url}\n\nHighlights:\n• Integrates frontend forms directly to n8n pipelines\n• Content generated on the fly via Groq AI\n• Ready-to-approve copy for LinkedIn, Telegram, and more!`,
      hashtags: ['#ArtificialIntelligence', '#Automation', '#NoCode', '#SaaS', '#ContentMarketing', '#n8n'],
      articleImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      aiImage: `https://image.pollinations.ai/prompt/${encodeURIComponent('AI social media automation SaaS platform #ArtificialIntelligence #Automation')}`,
    };
  }

  try {
    const response = await axios.post(N8N_URL, { url }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log the full raw response before any parsing
    console.log('[OmniSocial] Raw n8n response status:', response.status);
    console.log('[OmniSocial] Raw n8n response data:', JSON.stringify(response.data, null, 2));

    // n8n can return either a plain object or a single-item array — normalise to object
    const raw = Array.isArray(response.data) ? response.data[0] : response.data;

    console.log('[OmniSocial] Normalised response object:', raw);

    // Resolve image from any common key n8n might use
    const resolvedImage =
      raw.image ||
      raw.imageUrl ||
      raw.image_url ||
      raw.articleImage ||
      raw.article_image ||
      raw.thumbnail ||
      null;

    const parsed = {
      linkedin:  raw.linkedin  || raw.linkedinPost  || raw.linkedin_post  || '',
      telegram:  raw.telegram  || raw.telegramPost  || raw.telegram_post  || '',
      hashtags:  raw.hashtags  || raw.tags          || [],
      // articleImage: real extracted URL or null
      articleImage: resolvedImage,
      // aiImage: Pollinations URL built from content (always available)
      aiImage: `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${raw.telegram || raw.telegramPost || ''} ${(raw.hashtags || raw.tags || []).join(' ')}`
      )}`,
    };

    console.log('[OmniSocial] Parsed frontend state:', {
      linkedinLength: parsed.linkedin.length,
      telegramLength: parsed.telegram.length,
      hashtagCount:   parsed.hashtags.length,
      articleImage:   parsed.articleImage,
      aiImage:        parsed.aiImage,
    });

    return parsed;
  } catch (error) {
    console.error('API Error during content generation:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to connect to the n8n generation API. Make sure your server is online and CORS is configured.'
    );
  }
};

const TELEGRAM_PUBLISH_URL = import.meta.env.VITE_N8N_TELEGRAM_PUBLISH_URL;

/**
 * Publish content to Telegram via n8n workflow.
 *
 * Sends multipart/form-data so an uploaded File can be included directly.
 * - AI / article image  → imageUrl field (string)
 * - Custom upload       → imageFile field (File object)
 */
export const publishToTelegram = async (telegram, imageUrl, botToken, channelId, imageFile = null) => {
  const formData = new FormData();
  formData.append('telegram', telegram);
  formData.append('botToken', botToken);
  formData.append('channelId', channelId);
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  console.log('[OmniSocial] Telegram publish payload:', {
    telegramLength: telegram?.length,
    imageUrl: imageUrl || null,
    imageFile: imageFile ? imageFile.name : null,
    channelId,
    botToken: botToken ? '***set***' : '(missing)',
  });

  const response = await axios.post(TELEGRAM_PUBLISH_URL, formData);
  // Note: do NOT set Content-Type manually — axios derives it from FormData
  // and automatically includes the required multipart boundary parameter.

  console.log('[OmniSocial] Telegram publish webhook response:', response.data);

  return response.data;
};

const LINKEDIN_PUBLISH_URL = import.meta.env.VITE_N8N_LINKEDIN_PUBLISH_URL;

/**
 * Publish content to LinkedIn via n8n workflow.
 *
 * - postType 'text'     → JSON, no image fields
 * - postType 'ai-image' → JSON, imageUrl string
 * - postType 'image'    → multipart/form-data, imageFile binary + all text fields
 */
export const publishToLinkedIn = async (linkedin, hashtags, imageUrl, accessToken, personId, postType, imageFile = null) => {

  // Uploaded image: must use multipart/form-data to carry the binary File
  if (postType === 'image' && imageFile) {
    const formData = new FormData();
    formData.append('postType', postType);
    formData.append('linkedin', linkedin);
    formData.append('hashtags', JSON.stringify(hashtags));
    formData.append('accessToken', accessToken);
    formData.append('personId', personId);
    formData.append('imageFile', imageFile);

    console.log('[OmniSocial] LinkedIn publish (multipart):', {
      postType,
      linkedinLength: linkedin?.length,
      imageFile: imageFile.name,
      personId,
      accessToken: accessToken ? '***set***' : '(missing)',
    });
    for (const [key, value] of formData.entries()) {
      console.log('FORMDATA:', key, value instanceof File ? `File(${value.name}, ${value.size}b)` : value);
    }

    const response = await axios.post(LINKEDIN_PUBLISH_URL, formData);
    console.log('[OmniSocial] LinkedIn publish webhook response:', response.data);
    return response.data;
  }

  // Text-only or URL-based image: send JSON
  const payload = { postType, linkedin, hashtags, accessToken, personId };
  if (imageUrl) payload.imageUrl = imageUrl;

  console.log('[OmniSocial] LinkedIn publish (JSON):', {
    postType,
    linkedinLength: linkedin?.length,
    imageUrl: imageUrl || null,
    personId,
    accessToken: accessToken ? '***set***' : '(missing)',
  });

  const response = await axios.post(LINKEDIN_PUBLISH_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('[OmniSocial] LinkedIn publish webhook response:', response.data);
  return response.data;
};
