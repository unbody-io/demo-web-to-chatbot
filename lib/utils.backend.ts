
export const downloadFavicon = async (url: string) => {
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    const faviconUrls = [
      `${url}/favicon.ico`,
      `${url}/favicon.png`,
    ];

    let response;
    for (const faviconUrl of faviconUrls) {
      try {
        response = await fetch(faviconUrl);
        if (response.ok) break;
      } catch (e) {
        continue;
      }
    }

    if (!response || !response.ok) {
      throw new Error('Could not find favicon');
    }

    // Get the image data as buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Save to public directory
    const fs = require('fs');
    const path = require('path');
    
    // Create filename from domain
    const filename = `${domain.replace(/\./g, '_')}_favicon.ico`;
    const filepath = path.join(process.cwd(), 'public', filename);

    // Write file
    fs.writeFileSync(filepath, Buffer.from(imageBuffer));

    return `/` + filename; // Return the public URL path
  } catch (error) {
    console.error('Error downloading favicon:', error);
    return null;
  }
}

export const everyXSeconds = (seconds: number, callback: () => void) => {
  setTimeout(() => {
    callback()
    everyXSeconds(seconds, callback)
  }, seconds * 1000)
}