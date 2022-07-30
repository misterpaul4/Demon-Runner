import '../style.css';
import settings from '../config/gameConfig';
import { fetchUserBestScore } from './leaderBoardAPI';

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
    const usernameAlert = document.createElement('p');
    const inputWrapper = document.createElement('div');

    userInput.id = 'username';
    formContainer.id = 'userForm';
    userInput.placeholder = 'player name';
    submitBtn.type = 'submit';
    usernameAlert.className = 'username-alert';
    inputWrapper.id = 'input-wrapper';

    usernameAlert.textContent = '* Please enter your preferred player name';
    inputWrapper.appendChild(userInput);
    inputWrapper.appendChild(submitBtn);
    formContainer.appendChild(inputWrapper);
    formContainer.appendChild(usernameAlert);
    document.body.appendChild(formContainer);

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const username = userInput.value;
      if (username) {
        localStorage.setItem('username', username);
        // get best score
        fetchUserBestScore(username).catch(() => {});

        formContainer.style.display = 'none';
        display(username, reff, ' ');
      } else {
        // display warning
        const alertBox = document.querySelector('.username-alert');
        alertBox.classList.add('show-warning');
      }
    });
  };

  return { enter, display };
})();