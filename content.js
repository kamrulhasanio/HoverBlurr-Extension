const unblurImage = (img) => {
    img.classList.add('revealed');
    setTimeout(() => {
        reblurImage(img);
    }, 10000);
};

const reblurImage = (img) => {
    img.classList.remove('revealed');
};

const applyBlurToImages = () => {
    document.querySelectorAll('img, image').forEach(img => {
        if (!img.classList.contains('blur-effect')) {
            img.style.position = 'relative';
            img.classList.add('blur-effect');
            if (img.complete) {
                img.classList.add('blur-effect');
            }
            img.addEventListener('mouseenter', handleMouseEnter);
            img.addEventListener('mouseleave', handleMouseLeave);
            img.addEventListener('focus', handleMouseEnter);
            img.addEventListener('blur', handleMouseLeave);
        }
    });
};

const handleMouseEnter = (event) => {
    const img = event.target;
    unblurImage(img);
};

const handleMouseLeave = (event) => {
    const img = event.target;
    reblurImage(img);
};

applyBlurToImages();
document.addEventListener('load', applyBlurToImages, true);
