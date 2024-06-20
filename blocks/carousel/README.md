Prompt:

```
You are an expert web developer, specialised in building building web experiences and writing clean and sharp Javascript and CSS code.
All code you write is compliant with airbnb code linting.
You use only camelcase notation but never repeat parent selector name.
You always use CSS and never inline or define element styles in Javascript.

You generate some Javascript and CSS code. The code represents a "block". This "block" is self contained and loaded by some external code.

Block receives the following input as a `block` DOM element:

`<div class="carousel">
  <div>
    <div>Nespresso ads carousel</div>
    <div>
      <picture>
        <source type="image/webp" srcset="./media_14dae645c1dfba950bcf2753b8ed9fc049466ef63.png?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
        <source type="image/webp" srcset="./media_14dae645c1dfba950bcf2753b8ed9fc049466ef63.png?width=750&#x26;format=webply&#x26;optimize=medium">
        <source type="image/png" srcset="./media_14dae645c1dfba950bcf2753b8ed9fc049466ef63.png?width=2000&#x26;format=png&#x26;optimize=medium" media="(min-width: 600px)">
        <img loading="lazy" alt="" src="./media_14dae645c1dfba950bcf2753b8ed9fc049466ef63.png?width=750&#x26;format=png&#x26;optimize=medium" width="600" height="320">
      </picture>
    </div>
  </div>
  <div>
    <div>Jean loves coffee!</div>
    <div>
      <picture>
        <source type="image/webp" srcset="./media_1d896273008e030c981a8b6123be29c7040360255.png?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
        <source type="image/webp" srcset="./media_1d896273008e030c981a8b6123be29c7040360255.png?width=750&#x26;format=webply&#x26;optimize=medium">
        <source type="image/png" srcset="./media_1d896273008e030c981a8b6123be29c7040360255.png?width=2000&#x26;format=png&#x26;optimize=medium" media="(min-width: 600px)">
        <img loading="lazy" alt="" src="./media_1d896273008e030c981a8b6123be29c7040360255.png?width=750&#x26;format=png&#x26;optimize=medium" width="1280" height="640">
      </picture>
    </div>
  </div>
  <div>
    <div>What else ?</div>
    <div>
      <picture>
        <source type="image/webp" srcset="./media_1a880a2d54c6a2e3fcd6bf8edf985485c6a1045d7.png?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
        <source type="image/webp" srcset="./media_1a880a2d54c6a2e3fcd6bf8edf985485c6a1045d7.png?width=750&#x26;format=webply&#x26;optimize=medium">
        <source type="image/png" srcset="./media_1a880a2d54c6a2e3fcd6bf8edf985485c6a1045d7.png?width=2000&#x26;format=png&#x26;optimize=medium" media="(min-width: 600px)">
        <img loading="lazy" alt="" src="./media_1a880a2d54c6a2e3fcd6bf8edf985485c6a1045d7.png?width=750&#x26;format=png&#x26;optimize=medium" width="850" height="643">
      </picture>
    </div>
  </div>
</div>`

The input is a list of text and images. The list is represented with nested div and each child div of the `.carousel` element represents a slide.

The expected outputs:

- one carousel.js file: 
  - with a default exported `decorate(block)` method
  - the `decorate` method has one `block` parameter which is the `.carousel` DOM element of the input
  - method convert the input into a image carousel - images and corresponding text will nice flip one after the other.
  - the carousel design looks modern:
    - images should have a fixed height of 400px, aspect ratio must be respected and the rest of the screen width must be filled with a dark grey.
    - images have rounded corners.
    - text is converted into a heading 2 and nicely overlap the corresponding image (center top).
    - carousel item transition must be smooth and automatic (every 5s). 
    - bullets must be added, they overlap the image (bottom) and allow to manually change the carousel item.
- one carousel.css file
  - all css class definitions must prepend the `.carousel` selector
```