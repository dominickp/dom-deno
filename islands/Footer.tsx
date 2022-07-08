/** @jsx h */
import { h } from "preact";

export default function Footer() {
  return (
    <div id="footer">
      {/* https://icon-sets.iconify.design/?query=github */}
      <span class="iconify" data-icon="simple-icons:deno"></span>{" "}
      <a href="https://deno.com/deploy" target="_blank">
        Hosted by Deno Deploy
      </a>
      <span class="iconify" data-icon="fa-solid:lemon"></span>
      <a href="https://fresh.deno.dev/" target="_blank">Built with Fresh</a>
      <span class="iconify" data-icon="simple-icons:github"></span>{" "}
      <a href="https://github.com/dominickp/dom-deno" target="_blank">
        Source on GitHub
      </a>
    </div>
  );
}
