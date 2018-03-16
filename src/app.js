import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import cityData from './data.json';
import './styles/_style.scss';
import { Image, Navbar, Nav, NavItem, NavbarCollapse, Form, FormGroup, FormControl, Button, Radio, ButtonToolbar} from 'react-bootstrap';
import { Map, Scene,esriPromise } from 'react-arcgis';

class App extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            maps: ['Bucharest'],
            locationsCount: 0,
            numberRandomMaps: 5,
            type: 'map'
        };
        this.handleAddMap = this.handleAddMap.bind(this);
        this.handleAddLocationCount = this.handleAddLocationCount.bind(this);
        this.handleSetInitialCount = this.handleSetInitialCount.bind(this);
        this.handleChangeType = this.handleChangeType.bind(this);
        this.handleResetApp = this.handleResetApp.bind(this);
    };
    
    handleAddMap(locatie){
        this.setState((prevState) => ({ maps : prevState.maps.concat(locatie)}));
    }

    handleAddLocationCount(value) {
        this.setState((prevState) => ({ locationsCount: prevState.locationsCount + value}));
    }

    handleSetInitialCount(number){
        this.setState(() => ({ locationsCount : number}));
    }

    handleChangeType(type){
        this.setState(() => ({type}))
    }

    handleResetApp() {
        this.setState(() => ({maps: ['Bucharest']}));
    }

    render() {
        return (
            <div>
                <Header handleAddMap={this.handleAddMap} 
                        locationsCount={this.state.locationsCount} 
                        handleAddLocationCount={this.handleAddLocationCount} 
                        handleChangeType={this.handleChangeType}
                        randomNo={this.state.numberRandomMaps}
                        handleResetApp={this.handleResetApp}
                />
                <Maps   maps={this.state.maps} 
                        handleSetInitialCount = {this.handleSetInitialCount} 
                        type={this.state.type}
                />
            </div>
        )
    }
};

class Header extends Component {

    constructor(props){
        super(props);
        this.addNewMap = this.addNewMap.bind(this);
        this.addRandom = this.addRandom.bind(this);
        this.resetApp = this.resetApp.bind(this);
    }

    componentDidMount(){
        let radioForm = document.getElementById('typeSelector');
        radioForm.addEventListener('change', () => {
            let mapOption = document.getElementById("mapOption").checked;
            let sceneOption = document.getElementById("sceneOption").checked;
            mapOption === true ? this.props.handleChangeType('map') : this.props.handleChangeType('scene')
        });   
    }


    addNewMap(e){
        e.preventDefault();
        const locatie = e.target.elements.map.value.trim();
        this.props.handleAddMap(locatie);
        this.props.handleAddLocationCount(1);
        e.target.elements.map.value = "";
    }

    addRandom(e){
        e.preventDefault();
        
        let noOfLocations = parseInt(document.getElementById('noOfLocations').innerText.split(' ')[1]);
        this.props.handleAddLocationCount(5);
        esriPromise(["esri/tasks/Locator", "esri/geometry/Point", "esri/geometry/SpatialReference"]).then(([Locator, Point, SpatialReference]) => {
            
            const locatorTask = new Locator({
                url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            });

            for (let x = 0; x < noOfLocations; x++) {
                
                let Lat = Math.round((Math.random() * 180 - 90) * 1000) / 1000;
                let Long = Math.round((Math.random() * 360 - 180) * 1000) / 1000;
                
                
                
                let point = new Point(Long, Lat, new SpatialReference({ wkid: 4326 }));
                
                
                locatorTask.locationToAddress(point, 100)
                    .then((response) => {
                        console.log(response);
                        this.props.handleAddMap(response.address);
                    })
                    .otherwise((err) => {
                        console.log(cityData);
                        let randomCityNr = Math.round(Math.random() * 250);
                        let randomCityName = cityData[randomCityNr]['capital'];
                        this.props.handleAddMap(randomCityName);
                    });
            }
        });
    }

    resetApp() {
        this.props.handleResetApp();
    }

    render(){
        return (
            <Navbar fluid>
                <Navbar.Header >
                    <Navbar.Brand >
                        <a href="https://github.com/nicksenger/react-arcgis" target="_blank" ><p className="header__title">React-ArcGIS</p></a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                
                <Navbar.Collapse>
                    <Navbar.Form pullLeft onSubmit={this.addNewMap}>
                        <form>
                            <FormGroup>
                                <FormControl className="title__header" type="text" name="map" placeholder="Add a location" />
                            </FormGroup>{' '}
                            <Button type="submit">Add Map</Button>
                        </form>
                    </Navbar.Form>
                    <Nav>
                        <NavItem>
                            <span className="header__noLocations">No. of locations: {this.props.locationsCount}</span>
                        </NavItem>
                    </Nav>
                    <Nav>
                        <FormGroup id="typeSelector" >
                            <Radio type="radio" id="mapOption" name="type" value="Map" defaultChecked inline>
                                2D Map
                        </Radio>
                            <Radio type="radio" id="sceneOption" name="type" value="Scene" inline>
                                3D Scene
                        </Radio>
                        </FormGroup>
                    </Nav>
                    <Navbar.Form  onSubmit={this.addRandom}>
                        <form>
                            <Nav>
                                <NavItem>
                                    <p id='noOfLocations'>Add {this.props.randomNo} random location/s</p>
                                </NavItem>
                            </Nav>
                            <Button type="submit">Submit</Button>
                            <Button onClick={this.resetApp} id="header__reset">Reset</Button> 
                            <span>
                                <a href="https://reactjs.org/" target="_blank"><img src={require('./img/react.png')} height="40" width="40" id="header__logo" /></a>
                            </span>
                            <Nav pullRight>
                                <NavItem href="https://github.com/ialixandroae" id="header__github" target="_blank">
                                    <i className="fa fa-github" aria-hidden="true"></i>GitHub
                                </NavItem>
                            </Nav>
                            <Nav pullRight>
                                <NavItem href="https://twitter.com/ialixandroae" id="header__twitter" target="_blank">
                                    <i className="fa fa-twitter"  aria-hidden="true"></i>Twitter
                                </NavItem>
                            </Nav>
                        </form>
                    </Navbar.Form>
                </Navbar.Collapse>
            </Navbar>
        )
    }
};


class Maps extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        const number = this.props.maps.length;
        this.props.handleSetInitialCount(number);
    }

    render() {
        return (
            <div>
                {this.props.maps.length === 0 && <p>Please add a map</p>}
                {this.props.type === 'map' 
                ? 
                    this.props.maps.map((map, index) => {
                        return <Mapp key={index} location={map} />
                    })
                : 
                    this.props.maps.map((map,index) => {
                        return <Scenee key={index} location={map}/>
                    }) 
                }
            </div>
        )
    }
};

class Mapp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mapStyle: {
                width: '350px', 
                height: '350px', 
                float: 'left', 
                marginLeft: '25px', 
                marginTop: '20px',
                border: '1px solid rgba(160, 160, 160, 0.2)',
                boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)'
            }
        };
        
        this.handleMapLoad = this.handleMapLoad.bind(this)
    };

    handleMapLoad(map, view) {
        this.setState({ map, view });
        
            esriPromise(['esri/widgets/Search']).then(([Search]) => {
                const search = new Search({
                    view: this.state.view,
                    popupEnabled: false,
                    resultGraphicEnabled: false
                });

                search.search(this.props.location);
            });  
    }

    render() {
        return (
            
                <Map
                    style={this.state.mapStyle}
                    class="full-screen-map"
                    mapProperties={{ basemap: 'satellite' }}
                    viewProperties={{ center: [25, 45] }}
                    onLoad={this.handleMapLoad}
                    location={this.props.map}
                />
            
            
        )
    }
}

class Scenee extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mapStyle: {
                width: '350px',
                height: '350px',
                float: 'left',
                marginLeft: '25px',
                marginTop: '20px',
                border: '1px solid rgba(160, 160, 160, 0.2)',
                boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)'
            }
        };
        this.handleMapLoad = this.handleMapLoad.bind(this)
    };

    handleMapLoad(map, view) {
        this.setState({ map, view });

        esriPromise(['esri/widgets/Search']).then(([Search]) => {
            const search = new Search({
                view: this.state.view,
                popupEnabled: false,
                resultGraphicEnabled: false
            });
            search.search(this.props.location);
        });
    }

    render() {
        return (
            <Scene
                style={this.state.mapStyle}
                class="full-screen-map"
                mapProperties={{ basemap: 'satellite' }}
                viewProperties={{ center: [25, 45], heading: 95}}
                onLoad={this.handleMapLoad}
                location={this.props.map}
            />
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));

