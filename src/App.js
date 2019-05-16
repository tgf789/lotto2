import React,{Component} from 'react';
import CurrentEp from './Components/CurrentEp';
import NumberChart from './Components/NumberChart';
import RankingList from './Components/RankingList';
import { Fullpage, Slide, HorizontalSlider } from 'fullpage-react';

import './App.css';


class App extends Component {

  render(){
    // const horizontalSliderProps = {
    //   name: 'horizontalSlider', // name is required
    //   infinite: false, // enable infinite scrolling
    //   slides : [
    //     <Slide><CurrentEp/></Slide>,
    //     <Slide><NumberChart/></Slide>,
    //     <Slide><RankingList/></Slide>
    //   ]
    // }

    const fullPageOptions = {
      scrollSensitivity: 30,
      touchSensitivity: 10,
      scrollSpeed: 200,
      hideScrollBars: true,
      enableArrowKeys: true,
      slides : [
        <Slide><CurrentEp/></Slide>,
        <Slide><NumberChart/></Slide>,
        <Slide><RankingList/></Slide>
      ]
    }

    return (
      <div className="App" style={{height:"100%"}}>
        <Fullpage {...fullPageOptions} />
      </div>
    )
  }
}

export default App;
