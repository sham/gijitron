import React from 'react';
import Head from 'next/head';

import GijirokuMaker from '../components/GijirokuMaker';
import NoSSR from '../components/NoSSR';
import stylesheet from '../styles/start.css';


export default class extends React.Component {
  render() {
    const disableDnD = 'document.ondragover = document.ondrop = function(e) { e.preventDefault() }';
    return (<div id='container'>
      <Head>
        <title>gijitron</title>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <script dangerouslySetInnerHTML={{ __html: disableDnD }} />
      </Head>
      <NoSSR>
        <GijirokuMaker />
      </NoSSR>
    </div>);
  }
}
