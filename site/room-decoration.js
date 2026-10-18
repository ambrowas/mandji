(() => {
  const room = document.querySelector('#chapter-room');
  const photo = document.querySelector('.muni-photo');
  const dialog = document.querySelector('#muni-dialog');
  // Match the background image's cover crop before applying the same parallax.
  function alignPhoto() {
    const width = room.clientWidth, height = room.clientHeight;
    const scale = Math.max(width / 1672, height / 941);
    // Anchor these interactions to the background artwork, not viewport percentages.
    for (const [selector,x,y] of [['.hotspot-sebastian',1285,145],['.hotspot-map',1080,535],['.desk-computer',1080,535]]) {
      const spot=room.querySelector(selector);
      spot.style.left=`${Math.max(30,Math.min(width-30,(width-1672*scale)/2+x*scale))}px`;
      spot.style.top=`${Math.max(110,Math.min(height-30,(height-941*scale)/2+y*scale))}px`;
    }
    Object.assign(photo.style, {
      left: `${(width - 1672 * scale) / 2 + 992 * scale}px`,
      top: `${(height - 941 * scale) / 2 + 302 * scale}px`,
      width: `${134 * scale}px`, height: `${74 * scale}px`
    });
  }
  new ResizeObserver(alignPhoto).observe(room);
  alignPhoto();
  photo.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();
