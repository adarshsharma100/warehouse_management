import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const names = [
    { name: ' UIT', code: 'NY' },
    { name: 'DHT', code: 'RM' },

]
function CourierRules() {
    const [courierName, setCourierName] = useState('');
    const [minWeight, setMinWeight] = useState('');
    const [maxWeight, setMaxWeight] = useState('');
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const handleCancel = () => {
    };
    const [selectedCity, setSelectedCity] = useState(null);

    return (
        <div>
            <h1>Courier Rules</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="col-5">
                        <label htmlFor="courierName">Courier Name</label>
                    </div>
                    <div className="col-7">



                        <Dropdown
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.value)}
                            options={names}
                            optionLabel="name"
                            placeholder="Select a City"
                            className="w-full md:w-14rem" />

                    </div>
                </div>
                <br />
                <div className="grid">
                    <div className="col-5">
                        <label htmlFor="minWeight">Minimum Weight</label>
                    </div>
                    <div className="col-7">
                        <InputText
                            type="number"
                            id="minWeight"
                            name="minWeight"
                            // value={minWeight}
                            // onChange={(e) => setMinWeight(e.target.value)}
                        />
                    </div>
                </div>
                <br />
                <div className="grid">
                    <div className="col-5">
                        <label htmlFor="maxWeight">Maximum Weight</label>
                    </div>
                    <div className="col-7">

                        <InputText
                            type="number"
                            id="maxWeight"
                            name="maxWeight"
                           
                        />
                    </div>
                </div>
                <br />
                <div className="grid">
                    <div className="col-5">
                        <label htmlFor="startPoint">Start Point</label>
                    </div>
                    <div className="col-7">
                        <InputText
                            type="text"
                            id="startPoint"
                            name="startPoint"
                            value={startPoint}
                            onChange={(e) => setStartPoint(e.target.value)}
                        />
                    </div>
                </div>
                <br />
                <div className="grid">
                    <div className="col-5">
                        <label htmlFor="endPoint">End Point</label>
                    </div>
                    <div className="col-7">
                        <InputText
                            type="text"
                            id="endPoint"
                            name="endPoint"
                            value={endPoint}
                            onChange={(e) => setEndPoint(e.target.value)}
                        />
                    </div>
                </div>
                <br />
                <div className="grid">
                    <div className="col-6">
                        <button type="submit">Cancel</button>
                    </div>
                    <div className="col-6">
                        <button type="button" onClick={handleCancel}>
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CourierRules;
