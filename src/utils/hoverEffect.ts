/* eslint-disable @typescript-eslint/no-explicit-any */
export default (element: any, scale: any) => {
  element.setInteractive();
  element.on('pointerover', () => {
    element.setScale(scale);
  });

  element.on('pointerout', () => {
    element.setScale(1);
  });
};