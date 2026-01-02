// Color extraction utility
export const extractDominantColor = (imageSrc) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let r = 0, g = 0, b = 0, count = 0;

                // Sample every 10th pixel for performance
                for (let i = 0; i < data.length; i += 40) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                resolve(`${r}, ${g}, ${b}`);
            } catch (e) {
                console.error('Color extraction failed:', e);
                resolve('230, 0, 0'); // Default red
            }
        };

        img.onerror = () => {
            resolve('230, 0, 0'); // Default red
        };

        img.src = imageSrc;
    });
};

// Saturate RGB color for vibrant appearance
export const saturateColor = (rgbString) => {
    const [r, g, b] = rgbString.split(',').map(v => parseInt(v.trim()));
    
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
    }
    
    // Increase saturation significantly and brighten
    s = Math.min(s * 1.6, 1);
    l = Math.min(l * 1.1, 0.95);
    
    // Convert back to RGB
    const hslToRgb = (h, s, l) => {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        let rp, gp, bp;
        
        if (h < 1/6) { rp = c; gp = x; bp = 0; }
        else if (h < 2/6) { rp = x; gp = c; bp = 0; }
        else if (h < 3/6) { rp = 0; gp = c; bp = x; }
        else if (h < 4/6) { rp = 0; gp = x; bp = c; }
        else if (h < 5/6) { rp = x; gp = 0; bp = c; }
        else { rp = c; gp = 0; bp = x; }
        
        return [Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255)];
    };
    
    const [saturatedR, saturatedG, saturatedB] = hslToRgb(h, s, l);
    return `${saturatedR}, ${saturatedG}, ${saturatedB}`;
};

// Determine optimal text color with better contrast (WCAG AAA compliant)
export const getTextColorForBg = (rgbString) => {
    const [r, g, b] = rgbString.split(',').map(v => parseInt(v.trim()));
    
    // Calculate relative luminance (WCAG standard)
    const luminance = (value) => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    
    const L = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
    
    // Return white text for dark backgrounds, black for light
    // Using adjusted threshold for better visibility
    return L > 0.4 ? '#000000' : '#ffffff';
};

// Original vanilla JS logic for cover paths
const coverOverrides = {
    'heroes tonight animagus roy remix': 'heroes tonight',
    "abrar's entry jamal kudu from animal": 'abrars entry  jamal kudu from animal',
    'aadat remix': 'aadat',
    'kyaa baat haii 20 remix': 'kyaa baat haii 20',
    'be intehaan feat aks dj suketu remix': 'be intehaan feat aks',
    'dil diyan gallan lofi mix': 'dil diyan gallan',
    'ramaiya vastavaiya dj chetas mashup remix': 'ramaiya vastavaiya',
    'levitating vs adore you tik tok remix': 'levitating'
};


export const getSongCoverPath = (cover) => {
    if (!cover) return '/assets/images/cover/__missing__.jpg';

    let name = cover.toLowerCase().trim();

    if (coverOverrides[name]) {
        return `/assets/images/cover/${coverOverrides[name]}.jpg`;
    }

    let normalized = name
        .replace(/[''\"]/g, '')
        .replace(/\(remix\)/g, '')
        .replace(/\(kygo remix\)/g, '')
        .replace(/remix/g, '')
        .replace(/lofi mix/g, '')
        .replace(/radio edit/g, '')
        .replace(/\(feat\..*?\)/g, '')
        .replace(/version/g, '')
        .replace(/&/g, '')
        .replace(/-/g, ' ')
        .replace(/\b(x|feat|ft|mix|edit|version|remix)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (coverOverrides[normalized]) {
        return `/assets/images/cover/${coverOverrides[normalized]}.jpg`;
    }

    return `/assets/images/cover/${normalized}.jpg`;
};

export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
// Logarithmic volume conversion (decibel-based for better audio perception)
// Linear slider (0-100) => Exponential volume (decibels)
export const linearToLogarithmic = (linearValue) => {
    // linearValue: 0-100
    // Output: 0-1 (for audio element volume)
    // Using logarithmic scale: more sensitive at low volumes
    if (linearValue === 0) return 0;
    
    // Convert 0-100 to dB range -40dB to 0dB
    const dB = (linearValue / 100) * 40 - 40;
    
    // Convert dB back to linear volume (0-1)
    // Formula: 10^(dB/20)
    return Math.pow(10, dB / 20);
};

// Reverse: exponential volume to linear slider position
export const logarithmicToLinear = (exponentialVolume) => {
    // exponentialVolume: 0-1
    // Output: 0-100 (slider position)
    if (exponentialVolume === 0) return 0;
    
    // Convert linear (0-1) to dB
    const dB = 20 * Math.log10(exponentialVolume);
    
    // Convert dB (-40 to 0) to 0-100
    return Math.max(0, Math.min(100, (dB + 40) / 40 * 100));
};