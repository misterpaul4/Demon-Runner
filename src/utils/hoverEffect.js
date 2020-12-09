export default (element, scale) => {
  element.setInteractive();
  element.on('pointerover', () => {
    element.setScale(scale);
  });

  element.on('pointerout', () => {
    element.setScale(1);
  });
};