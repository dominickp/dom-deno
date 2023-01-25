/** @jsx h */
import { h } from "preact";
import Header from "../islands/Header.tsx";
import Homepage from "../islands/Homepage.tsx";
import Footer from "../islands/Footer.tsx";

export const Head = () => (
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="A portfolio website for Dominick."
    />
    <title>Dominick Peluso's Homepage</title>
    <link rel="stylesheet" href="/bulma.min.css" />
    <link rel="stylesheet" href="/index.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300&display=swap"
      rel="stylesheet"
    >
      <script src="https://code.iconify.design/2/2.2.1/iconify.min.js"></script>
    </link>
    <script src="doorbell.io.js"></script>
  </head>
);

export default function Home() {
  return (
    <div id="page-wrapper">
      <Head />
      <div id="stars" />
      <div id="stars2" />
      <div id="stars3" />

      <div class="columns">
        <div class="column" />
        <div class="column is-two-thirds content is-vcentered">
          <Header />
          <div class="box mx-5 glass">
            <Homepage />
          </div>
          <Footer />
        </div>
        <div class="column" />
      </div>
    </div>
  );
}
