import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { faker } from '@faker-js/faker'
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material'
import { ExportToCsv } from 'export-to-csv'

import randomUser from './api/randomUser'

const generateItems = (amount, region, errors) => {
    const arr = Array.from(Array(amount))
    return arr.map(() => randomUser(faker, region, errors))
}

export default function App() {
    const tableRef = useRef()
    const [seed, setSeed] = useState(Math.floor(Math.random() * 10000))
    const [region, setRegion] = useState('en_US')
    const [errors, setErrors] = useState(0)
    const [rows, setRows] = useState([])
    const [distanceBottom, setDistanceBottom] = useState(0)

    useEffect(() => {
        faker.seed(seed)
        setRows(generateItems(20, region, errors))
        tableRef.current.scrollTop = 0
    }, [seed, region, errors])

    const handleRegionChange = (event) => {
        setRegion(event.target.value)
    }

    const handleSeedChange = (event) => {
        const seed = +event.target.value
        if (!isNaN(seed)) {
            setSeed(seed)
        }
    }

    const handleRandomClick = () => {
        const seed = Math.floor(Math.random() * 100000)
        setSeed(seed)
    }

    const handleSliderErrorsChange = (event) => {
        setErrors(event.target.value)
    }

    const handleInputErrorsChange = (event) => {
        const errors = +event.target.value
        if (errors >= 0 && errors <= 1000) {
            setErrors(errors)
        }
    }

    const onExportClick = () => {
        const csvExporter = new ExportToCsv({
            showLabels: true,
            filename: 'fakeUsers',
            useKeysAsHeaders: true,
        })

        csvExporter.generateCsv(rows.map((v) => ({ ...v, phoneNumber: ' ' + v.phoneNumber })))
    }

    useLayoutEffect(() => {
        const scrollListener = () => {
            const bottom = tableRef.current.scrollHeight - tableRef.current.clientHeight
            if (!distanceBottom) {
                setDistanceBottom(Math.round(bottom * 0.2))
            }
            if (tableRef.current.scrollTop > bottom - distanceBottom) {
                setRows(rows.concat(generateItems(10, region, errors)))
            }
        }

        const ref = tableRef.current
        ref.addEventListener('scroll', scrollListener)
        return () => {
            ref.removeEventListener('scroll', scrollListener)
        }
    }, [rows, region, errors, distanceBottom])

    return (
        <div>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'baseline' }}>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <InputLabel id='region-select-label'>Region</InputLabel>
                    <Select
                        labelId='region-select-label'
                        value={region}
                        onChange={handleRegionChange}
                        autoWidth
                        label='Region'
                    >
                        <MenuItem value={'en_US'}>United States</MenuItem>
                        <MenuItem value={'ru'}>Russia</MenuItem>
                        <MenuItem value={'ge'}>Georgia</MenuItem>
                    </Select>
                </FormControl>
                <Slider
                    sx={{ p: 0, width: 160 }}
                    defaultValue={0}
                    step={0.25}
                    min={0}
                    max={10}
                    valueLabelDisplay='auto'
                    value={Math.min(errors, 10)}
                    onChange={handleSliderErrorsChange}
                />
                <TextField type='number' size='small' id='errors' value={errors} onChange={handleInputErrorsChange} />
                <TextField placeholder='Seed' size='small' id='seed' value={seed} onChange={handleSeedChange} />
                <Button variant='contained' onClick={handleRandomClick}>
                    Random
                </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 160px)' }} ref={tableRef}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>UUID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => (
                            <TableRow key={row.uuid}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row.uuid}</TableCell>
                                <TableCell>{row.fullName}</TableCell>
                                <TableCell>{row.fullAddress}</TableCell>
                                <TableCell>{row.phoneNumber}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <hr />
            <Button sx={{ m: 1 }} color='secondary' variant='contained' onClick={onExportClick}>
                Export to CSV
            </Button>
        </div>
    )
}
