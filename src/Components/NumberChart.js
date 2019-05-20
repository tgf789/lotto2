import React,{Component} from 'react'
import axios from 'axios'
import Chart from 'chart.js';
import {numberColor} from '../Asset'
import {isMobile} from 'react-device-detect';

export default class NumberChart extends Component{
    constructor(props){
        super(props)
        this.state = {
            chartData : [[,]]
        }
        this.chartRef = React.createRef()
    }

    componentDidMount(){
        console.log('...')
        axios.get('http://49.236.137.107:5000/getLottoNoHistory?order=cnt&by=desc')
        .then((response) => {
            if(response.status !== 200) throw Error(response.status + ' Error')
            if(response.data.result !== 'success') Error('data error')
            if(!response.data.responseData) Error('DB data Error')
            
            const {responseData} = response.data
            this.setState({
                chartData : responseData
            },()=>this.buildChart())
        })
        .catch(function (error) {
            console.log(error);
        });


        
    }

    buildChart= ()=>{
        const myChartRef = this.chartRef.current.getContext("2d");
        const {chartData} = this.state
        new Chart(myChartRef, {
            type: isMobile ? "horizontalBar" : "bar",
            data: {
                //Bring in data
                labels: chartData.map((val)=>val[0]),
                datasets: [
                    {
                        label: "NUM",
                        data: chartData.map((val)=>val[1]),
                        backgroundColor: chartData.map((val)=>numberColor[Math.floor((val[0]-1) / 10)])
                    }
                ],
                
            },
            options: {
                scales: {
                    
                    yAxes: [{
                        display : false
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                        }
                    }]
                },
                legend: {
                    display: false
                }
            }
        });

        

        console.log()
    }

    render(){
        return(
            <div style={{height:"100%"}}>
                <div className="cardContainer" style={{height:"100%"}}>
                <canvas
                    id="myChart"
                    ref={this.chartRef}
                    style={{height:"100%"}}
                />
                </div>
            </div>
        )
    }
}