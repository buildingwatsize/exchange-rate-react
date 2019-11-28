import React, { Component } from 'react'

import axios from 'axios'

import { Row, Col, Input, InputNumber, Select, Table, Button } from 'antd'
const { Option } = Select;

export class CurrencyExchange extends Component {
  state = {
    columns: [{
      title: 'สินค้า',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ราคา',
      dataIndex: 'price_usd',
      key: 'price_usd',
    },
    {
      title: 'ราคาบน',
      dataIndex: 'price_source',
      key: 'price_source',
    },
    {
      title: 'ราคาล่าง',
      dataIndex: 'price_destination',
      key: 'price_destination',
    }],
    data: [
      {
        key: '1',
        name: 'Camera',
        price_usd: 200,
        price_source: 200,
        price_destination: 200,
      },
      {
        key: '2',
        name: 'iPhone',
        price_usd: 1000,
        price_source: 1000,
        price_destination: 1000,
      },
    ],
    rateList: ["USD", "THB"],
    sourceCurrency: "USD",
    destinationCurrency: "THB",
    sourceAmount: 0,
    destinationAmount: 0,
    sourceRates: {},
  }

  handleChangeCurrency = (name) => (currency) => {
    this.setState({
      [name]: currency
    }, () => {
      this.setProductList()
    })
    if (name === "sourceCurrency") this.setCurrencyRate(currency)
    else this.setDestinationValueConverted(this.state.sourceAmount)
  }

  handleChangeAmount = (name) => (amount) => {
    this.setState({
      [name]: amount
    })
    if (name === "sourceAmount") this.setDestinationValueConverted(amount)
  }

  handleSwapCurrency = () => {
    console.log("swap");

    this.setState((state) => ({
      sourceCurrency: state.destinationCurrency,
      destinationCurrency: state.sourceCurrency
    }), () => {
      this.setCurrencyRate(this.state.sourceCurrency)
    })
  }

  setDestinationValueConverted = (amount) => {
    this.setState((state) => ({
      destinationAmount: state.sourceRates[state.destinationCurrency] * amount
    }))
  }

  setCurrencyRate = async (currency) => {
    let currencyData = await axios(`https://api.exchangeratesapi.io/latest?base=${currency}`)
    // console.log(currencyData.data.rates);
    this.setState({
      sourceRates: currencyData.data.rates,
      rateList: Object.keys(currencyData.data.rates)
    }, () => {
      this.setProductList()
      this.setDestinationValueConverted(this.state.sourceAmount)
    })
  }

  setProductList = () => {
    let { data, columns, sourceCurrency, destinationCurrency, sourceRates } = this.state
    columns[2].title = columns[2].title.split(" ")[0] + " (" + sourceCurrency + ")"
    columns[3].title = columns[3].title.split(" ")[0] + " (" + destinationCurrency + ")"
    data.forEach((item) => {
      item.price_source = item.price_usd * (1 / sourceRates["USD"])
      item.price_destination = sourceRates[destinationCurrency] * item.price_source
    })
    // data[1].price_source = 
    // data[1].price_destination = 
    this.setState({
      columns,
      data
    })
  }

  componentDidMount() {
    this.setCurrencyRate(this.state.sourceCurrency)
  }

  render() {
    return (
      <div className="fullWidth">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Input.Group compact>
              <Select defaultValue={this.state.rateList[0]} value={this.state.sourceCurrency} onChange={this.handleChangeCurrency("sourceCurrency")}>
                {this.state.rateList.map((rate, index) => (
                  <Option key={index} value={rate}>{rate}</Option>
                ))}
              </Select>
              <InputNumber onChange={this.handleChangeAmount("sourceAmount")} value={this.state.sourceAmount} />
            </Input.Group>
          </Col>
          <Col span={24}>
            <Input.Group compact>
              <Select defaultValue={this.state.rateList[1]} value={this.state.destinationCurrency} onChange={this.handleChangeCurrency("destinationCurrency")}>
                {this.state.rateList.map((rate, index) => (
                  <Option key={index} value={rate}>{rate}</Option>
                ))}
              </Select>
              <InputNumber onChange={this.handleChangeAmount("destinationAmount")} value={this.state.destinationAmount} />
            </Input.Group>
          </Col>
          <Col span={24}>
            <Button type="primary" shape="round" icon="transaction" onClick={this.handleSwapCurrency}>
              Swap Currency
            </Button>
          </Col>
          <Col span={24}>
            <Table bordered={true} dataSource={this.state.data} columns={this.state.columns} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default CurrencyExchange
