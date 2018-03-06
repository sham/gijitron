import React from 'react';
import Head from 'next/head';

import GijirokuMaker from '../components/GijirokuMaker';
import NoSSR from '../components/NoSSR';

import DraftCSS from 'draft-js/dist/Draft.css';

export default () => {
  const disableDnD = 'document.ondragover = document.ondrop = function(e) { e.preventDefault() }';
  return (<React.Fragment>
    <Head>
      <title>gijitron</title>
      <script dangerouslySetInnerHTML={{ __html: disableDnD }} />
    </Head>
    <NoSSR>
      <GijirokuMaker />
    </NoSSR>
    <style jsx global>{ DraftCSS }</style>
    <style jsx global>{`
      body {
        width: 100%;
        height: 100%;
        text-align: center;
        margin: 0px;
        padding: 0px;
        overflow: hidden;
      }

      .DraftEditor-root {
        margin: 5px auto 10px;
        width: calc(100vw - 10px);
        height: calc(100vh - 70px);
        text-align: left;
        overflow: auto;
        border: groove;
        border-color: #9de8f7;
        line-height: 1.2em;
      }

      .public-DraftStyleDefault-ul {
        margin: 8px 0px;
      }

      .public-DraftStyleDefault-ol {
        margin: 8px 0px;
      }

      .pukiH2 {
        font-family: verdana, arial, helvetica, Sans-Serif;
        color: inherit;
        background-color: #DDEEFF;
        padding: .5em;
        border: 0px;
        margin: 10px 0px;
      }

      .pukiH3 {
        font-family: verdana, arial, helvetica, Sans-Serif;
        border-bottom: 3px solid #DDEEFF;
        border-top: 1px solid #DDEEFF;
        border-left: 10px solid #DDEEFF;
        border-right: 5px solid #DDEEFF;
        color: inherit;
        background-color: #FFFFFF;
        padding: .3em;
        margin: 10px 0px;
      }

      .pukiH4 {
        font-family: verdana, arial, helvetica, Sans-Serif;
        border-left: 18px solid #DDEEFF;
        color: inherit;
        background-color: #FFFFFF;
        padding: .3em;
        margin: 10px 0px;
      }

      .pukiPre {
        padding: .3em 0px 0px .2em;
        margin: 0px 2em 0px 1em;
        white-space: pre;
        color: black;
        background-color: #F0F8FF;
        line-height: 1em;
      }
    `}</style>
  </React.Fragment>);
};
