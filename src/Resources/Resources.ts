async function loadResources() {
    window.RECEIVER_RESOURCES = {};
    const rawRESOURCES = localStorage.getItem('RECEIVER_RESOURCES');
    if (!rawRESOURCES) {
        return;
    }
    const {obj,state} = JSON.parse(rawRESOURCES);
    await Promise.all(Object.keys(obj).map(async (key) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('ctx is null');
        }
        window.RECEIVER_RESOURCES[key] = {canvas,context : ctx};
        const img = new Image();
        img.src = obj[key];
        await new Promise<void>((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                }
                resolve();
            };
        });
    }
    ));
    return state;
}

async function saveResources(state : any) {
    const resources = window.RECEIVER_RESOURCES;
    if (!resources) {
        return;
    }
    const obj: {
        [key: string]: string;
    } = {};
    await Promise.all(Object.keys(resources).map(async (key) => {
        const {canvas} = resources[key];
        const dataUrl = canvas.toDataURL();
        obj[key] = dataUrl;
    }
    ));
    localStorage.setItem('RECEIVER_RESOURCES', JSON.stringify({obj,state}));
}

function clearResources() {
    localStorage.removeItem('RECEIVER_RESOURCES');
}


export { loadResources, saveResources, clearResources };