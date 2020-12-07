import '../style.css';
import settings from '../config/gameConfig';

export default (() => {
  const display = (username, reff, newUser = ' back ') => {
    reff.add.text(settings.gameWidth / 2, 50, `welcome${newUser}${username}`, {
      font: '50px',
    }).setOrigin(0.5);
  };

  const enter = (reff) => {
    const formContainer = document.createElement('form');
    const userInput = document.createElement('input');
    const submitBtn = document.createElement('input');
    userInput.id = 'username';
    userInput.placeholder = 'username';
    submitBtn.type = 'submit';

    formContainer.appendChild(userInput);
    formContainer.appendChild(submitBtn);
    document.body.appendChild(formContainer);

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const username = userInput.value;
      localStorage.setItem('username', username);
      localStorage.setItem('best score', '0');
      formContainer.style.opacity = '0';

      // validate
      display(username, reff, ' ');
    });
  };

  return { enter, display };
})();