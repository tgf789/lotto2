import React,{Component} from 'react'
import axios from 'axios'
import cx from 'classnames'
import AnimatedNumber from 'react-animated-number'
import Loading from './Loading'

import {numberColor} from '../Asset'
import {formatMoney} from '../Util/'

export default class CurrentEp extends Component{
    constructor(props){
        super(props)
        this.state = {
            totalReward : 0,
            personalReward : 0,
            winnersCount : 0,
            no : [0,0,0,0,0,0,0],
            epNo : "0",
            epNoInput : "0",
            displayEpInputDialog: false,
            maxEpNo : -1,
            errMsg : "",
            isLoading : true,
        }

    }

    componentDidMount(){
        console.log('...')
        this.callEpNumbers();
    }

    callEpNumbers = () => {
        axios.get('http://49.236.137.107:5000/'+this.state.epNo)
        .then((response) => {
            if(response.status !== 200) throw Error(response.status + ' Error')
            if(response.data.result !== 'success') Error('data error')
            if(!response.data.responseData['episode_no']) Error('DB data Error')
            
            const {responseData} = response.data

            this.setState({
                totalReward : responseData['winners_amount'],
                personalReward : responseData['winner_amount_one'],
                winnersCount : responseData['winners_co'],
                epNo : responseData['episode_no'],
                epNoInput : responseData['episode_no'],
                no : [responseData['no1'],responseData['no2'],responseData['no3'],responseData['no4'],responseData['no5'],responseData['no6'],responseData['no7']],
                isLoading : false
            })

            if(this.state.maxEpNo === -1) this.setState({maxEpNo : responseData['episode_no']})
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    changeEpInput = (val) => {
        val = val.match(/[\d]*/g)[0];
        let errMsg = ""
        if(val >= this.state.maxEpNo) {
            val = this.state.maxEpNo
            errMsg = "현재 데이터베이스에 있는 최신 회차는 "+val+"회 입니다."
        }
        if(val < 1 && val !=="") {
            val = 1
            errMsg = "검색은 1회차부터 가능합니다."
        }
    
        this.setState({epNoInput: val,errMsg})
    }

    epDialogSwitch = (val) => {
        this.setState({displayEpInputDialog : val})
    }

    searchEp = () => {
        const {epNoInput} = this.state
        if(!epNoInput) {
            this.epDialogSwitch(false)
            return
        }

        this.setState({epNo:epNoInput}, ()=>this.callEpNumbers())
        this.epDialogSwitch(false)
    }

    render(){
        const {totalReward,personalReward,winnersCount,epNo,no,epNoInput,displayEpInputDialog,errMsg,isLoading} = this.state
        const animatedStyle = (fontSize = 48) => ({
            style:{
                transition: '0.8s ease-out',
                fontSize: fontSize
            },
            duration:500,
            formatValue:n => formatMoney(n)
        })
        return(
            <div className="cc">
                {isLoading ? <Loading/> :
                <div className="cardContainer">
                    <p><strong className="epNo" onClick={()=>this.epDialogSwitch(true)}>{epNo}</strong> 회차 당첨번호</p>
                    <p>
                        {no.map((item,index)=>
                            <span key={`bNum_${index}`}>
                                {index === 6 ? <span className="bonusPlus">+</span> : ""}
                                <span className={cx('noBall',{'bonusNo' : index === 6})} style={{backgroundColor:numberColor[Math.floor((item-1) / 10)]}}>
                                <AnimatedNumber component="b" value={item} {...animatedStyle()}/>
                                </span>
                            </span>)}
                    </p>
                    <p>
                    <AnimatedNumber component="span" value={personalReward} {...animatedStyle(18)}/> 원 
                    (<AnimatedNumber component="span" value={winnersCount} {...animatedStyle(18)}/>명) 
                    <span> / </span>
                    <AnimatedNumber component="span" value={totalReward} {...animatedStyle(18)}/> 원
                    
                    </p>
                </div>
                }


                {displayEpInputDialog && 
                <div className="epDialogArea" onClick={()=>this.epDialogSwitch(false)}>
                    <div className="epDialog" onClick={(e) => e.stopPropagation()}>
                        <input type="text" value={epNoInput} onChange={(e)=>this.changeEpInput(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') this.searchEp()}} />
                        {errMsg && <div className="errMsg">{errMsg}</div>}
                        <div className="btArea">
                        <input type="button" value="확인" onClick={()=>this.searchEp()}/>
                    </div>
                    </div>
                </div>
                }
                
            </div>
        )
    }
}