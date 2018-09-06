import * as React from 'react';
import Head from 'next/head';

import GijirokuMaker from '../components/GijirokuMaker';
import NoSSR from '../components/NoSSR';

const DraftCSS: string = require('draft-js/dist/Draft.css');
const style: string = require('../styles/style.css');

export default () => {
  const disableDnD: string = 'document.ondragover = document.ondrop = function(e) { e.preventDefault() }';
  const css = `${DraftCSS}\n${style}`;
  return (
  <React.Fragment>
    <Head>
      <title>gijitron</title>
      <script dangerouslySetInnerHTML={{ __html: disableDnD }} />
    </Head>
    <NoSSR>
      <GijirokuMaker />
    </NoSSR>
    <style jsx global>{css}</style>
  </React.Fragment>
  );
};
