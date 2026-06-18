// Cloudinary unsigned upload helper.
// Requires an UNSIGNED upload preset (Cloudinary → Settings → Upload → Upload presets).

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image File to Cloudinary.
 * @param {File} file
 * @param {(pct:number)=>void} [onProgress] optional 0..100 progress callback
 * @returns {Promise<{url:string, publicId:string, width:number, height:number}>}
 */
export function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!CLOUD || !PRESET) {
      reject(new Error('Cloudinary env vars are missing (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).'));
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', PRESET);
    fd.append('folder', '5brushes/artworks');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        });
      } else {
        reject(new Error('Cloudinary upload failed: ' + xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
    xhr.send(fd);
  });
}

/**
 * Build a transformed delivery URL from a stored public_id.
 * Falls back to the raw url if no public_id.
 */
export function cldUrl(publicId, { w = 900, fit = 'limit' } = {}) {
  if (!publicId) return '';
  const crop = fit === 'fill' ? 'c_fill,g_auto' : 'c_limit';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,${crop},w_${w}/${publicId}`;
}
