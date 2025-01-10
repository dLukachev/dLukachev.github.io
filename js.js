document.addEventListener('DOMContentLoaded', () => {
    const errorText = document.getElementById('error-text');
    const jokeText = document.getElementById('joke-text');
    const content = document.getElementById('content');
    const avatar = document.querySelector('.avatar');
    const container = document.querySelector('.container');

    avatar.style.transform = 'scale(0.5)';
    avatar.style.opacity = '0';

    container.style.transform = 'translateY(-20px)';
    container.style.opacity = '0';


    setTimeout(() => {
        errorText.style.opacity = 0;
        jokeText.style.opacity = 1;
    }, 1000);

     setTimeout(() => {
        const initialScreen = document.getElementById('initial-screen');
        initialScreen.style.display = 'none'; //hide the initial screen
        content.classList.remove('hidden'); // show the site
        content.style.opacity = 1;
        document.body.style.overflow = 'auto'; //enable scrolling

         // Анимация появления контента (перенесена сюда)
            avatar.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            avatar.style.transform = 'scale(1)';
            avatar.style.opacity = '1';

            container.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            container.style.transform = 'translateY(0)';
            container.style.opacity = '1';

    }, 2000);

    avatar.addEventListener('mouseenter', function() {
      avatar.style.transform = 'scale(1.1)';
    });

    avatar.addEventListener('mouseleave', function() {
      avatar.style.transform = 'scale(1)';
    });
});