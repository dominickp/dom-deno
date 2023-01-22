/** @jsx h */
import { h } from "preact";

export default function Homepage() {
  return (
    <div>
      <article class="media">
        <div class="media-left is-hidden-mobile">
          <figure class="image is-128x128">
            <img
              class="is-rounded"
              src="dom.jpg"
              alt="Profile picture"
            />
          </figure>
        </div>
        <div class="media-content">
          <div>
            <h2>Professional Stuff</h2>
            <p>
              I'm currently a cloud software engineer at Bose. I design,
              build, test, and operate cloud microservices that are used by millions of
              users and devices.
            </p>
            <p>
              I have a bit of experience in a lot of others areas too, including: 
              back-end and front-end web development, 
              print automation, and process improvement.
            </p>
          </div>
        </div>
      </article>
      <br />
      <div class="block">
        <p class="buttons is-centered">
          <a
            class="button is-link is-normal"
            href="./resume.pdf"
            target="_blank"
          >
            <span class="iconify" data-icon="fa-solid:file-pdf">
            </span>&nbsp;&nbsp; My resume
          </a>

          <a
            class="button is-link is-normal"
            href="https://github.com/dominickp"
            target="_blank"
          >
            <span class="iconify" data-icon="simple-icons:github">
            </span>&nbsp;&nbsp; dominickp
          </a>

          <a
            class="button is-link is-normal"
            href="https://github.com/Dominick-Peluso-Bose"
            target="_blank"
          >
            <span class="iconify" data-icon="simple-icons:github">
            </span>&nbsp;&nbsp; Dominick-Peluso-Bose
          </a>

          <a
            class="button is-link is-normal"
            href="https://www.linkedin.com/in/dominickpeluso/"
            target="_blank"
          >
            <span class="iconify" data-icon="simple-icons:linkedin">
            </span>&nbsp;&nbsp; LinkedIn
          </a>

          <a
            class="button is-link is-normal"
            onClick={() => {
              popup = window.open(
                "https://mailhide.io/e/y0Q94",
                "mailhidepopup",
                "width=580,height=635",
              );
              return false;
            }}
          >
            <span class="iconify" data-icon="entypo:mail">
            </span>&nbsp;&nbsp; Email me
          </a>
        </p>
      </div>

      <hr />

      <article class="media">
        <div class="media-left is-hidden-mobile">
          <figure class="image is-128x128">
            <a href="stream.png" target="_blank">
              <img
                src="stream.png"
                alt="ITG livestream"
              />
            </a>
          </figure>
        </div>
        <div class="media-content">
          <div>
            <h2>ITG Stuff</h2>
            <p>
              One of my favorite hobbies is playing In The Groove (ITG) which is
              a somewhat obscure arcade dance game from the early 2000s. I play
              a variant of ITG which is focused on stamina and speed as one of
              my workout routines.
            </p>
            <p>
              I stream live on my Twitch channel and I also make ITG videos on
              YouTube once in a while.
            </p>
          </div>
        </div>
      </article>
      <br />
      <div class="block">
        <p class="buttons is-centered">
          <a
            class="button is-link is-normal"
            href="https://www.twitch.tv/dom_itg"
            target="_blank"
          >
            <span class="iconify" data-icon="simple-icons:twitch">
            </span>&nbsp;&nbsp; Dom_ITG
          </a>
          <a
            class="button is-link is-normal"
            href="https://www.youtube.com/channel/UCpeNRVOVrqx_lras7hbOOrQ"
            target="_blank"
          >
            <span class="iconify" data-icon="simple-icons:youtube">
            </span>&nbsp;&nbsp; Dom_ITG
          </a>
        </p>
      </div>
    </div>
  );
}
