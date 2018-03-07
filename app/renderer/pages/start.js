import React from 'react';
import Head from 'next/head';

import GijirokuMaker from '../components/GijirokuMaker';
import NoSSR from '../components/NoSSR';

import DraftCSS from 'draft-js/dist/Draft.css';
import style from '../styles/style.css';

export default () => {
  const disableDnD = 'document.ondragover = document.ondrop = function(e) { e.preventDefault() }';
  const css = `${DraftCSS}\n${style}`;
  return (<React.Fragment>
    <Head>
      <title>gijitron</title>
      <script dangerouslySetInnerHTML={{ __html: disableDnD }} />
    </Head>
    <NoSSR>
      <GijirokuMaker />
    </NoSSR>
    <style jsx global>{ css }</style>
  </React.Fragment>);
};
