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

    userInput.id = 'username';
    userInput.placeholder = 'username';
    submitBtn.type = 'submit';
    usernameAlert.className = 'username-alert';

    usernameAlert.textContent = '* Please enter your username';

    formContainer.appendChild(userInput);
    formContainer.appendChild(submitBtn);
    formContainer.appendChild(usernameAlert);
    document.body.appendChild(formContainer);

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const username = userInput.value;
      localStorage.setItem('username', username);
      // get best score
      const bestScore = fetchUserBestScore(username);
      localStorage.setItem('best score', `${bestScore}`);

      formContainer.style.display = 'none';
      display(username, reff, ' ');
    });
  };

  return { enter, display };
})();