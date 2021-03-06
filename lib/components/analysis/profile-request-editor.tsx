import {
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  Select,
  SimpleGrid
} from '@chakra-ui/core'
import get from 'lodash/get'
import {forwardRef, useState, useCallback} from 'react'
import DateTime from 'react-datetime'

import useInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'

import TimePicker from '../time-picker'

// DateTime does not have a `renderInput`
const DateTimeWithRender = DateTime as any

const DATE_FORMAT = 'YYYY-MM-DD'

const bold = (b) => `<strong>${b}</strong>`

function bundleIsOutOfDate(bundle, dateString, project) {
  if (project === null || project === undefined) return
  const date = new Date(dateString)
  const {serviceEnd, serviceStart} = bundle
  if (
    bundle != null &&
    (new Date(serviceStart) > date || new Date(serviceEnd) < date)
  ) {
    return message('analysis.bundleOutOfDate', {
      bundle: bold(bundle.name),
      project: bold(project.name),
      serviceStart: bold(serviceStart),
      serviceEnd: bold(serviceEnd),
      selectedDate: bold(dateString)
    })
  }
}

const InputWithUnits: React.ComponentType<{units: string} & any> = forwardRef(
  (props, ref) => {
    const {units, ...p} = props
    return (
      <InputGroup>
        <Input {...p} ref={ref} />
        <InputRightElement
          color='gray.400'
          userSelect='none'
          width='unset'
          mr={4}
        >
          {units}
        </InputRightElement>
      </InputGroup>
    )
  }
)

// Helper function for testing inputs
const valueWithin = (min: number, max: number) => (v) => {
  return v >= min && v <= max
}

// Helper for max mode times which can be null
const modeLessThanMax = (max: number) => (v) => {
  return isNaN(v) ? true : v <= max
}

// Create the functions here so they are not generated on each render
const testWalkSpeed = valueWithin(3, 15)
const testWalkTime = modeLessThanMax(60)
const testBikeSpeed = valueWithin(5, 20)
const testBikeTime = modeLessThanMax(60)
const testMonteCarlo = valueWithin(1, 10000)
const testMaxTransfers = valueWithin(0, 7)

// Check modes for the type given
const containsType = (pr, type) =>
  pr.accessModes.indexOf(type) > -1 ||
  pr.directModes.indexOf(type) > -1 ||
  (pr.egressModes.indexOf(type) > -1 && pr.transitModes.length > 0)

/**
 * Edit the parameters of a profile request.
 */
export default function ProfileRequestEditor({
  bundle,
  color = 'blue',
  disabled,
  profileRequest,
  project,
  setProfileRequest,
  ...p
}) {
  const setFromTime = (fromTime) =>
    setProfileRequest({fromTime: parseInt(fromTime)})
  const setToTime = (toTime) => setProfileRequest({toTime: parseInt(toTime)})

  const [dateIsValid, setDateIsValid] = useState(true)
  function setDate(date) {
    if (!date || !date.isValid || !date.isValid()) {
      return setDateIsValid(false)
    }
    setDateIsValid(true)
    setProfileRequest({date: date.format(DATE_FORMAT)})
  }

  const {date, fromTime, toTime} = profileRequest
  const bundleOutOfDate = bundleIsOutOfDate(bundle, date, project)

  const setWalkSpeed = useCallback(
    (walkSpeed) => setProfileRequest({walkSpeed: walkSpeed / 3.6}), // km/h to m/s
    [setProfileRequest]
  )
  const walkSpeedInput = useInput({
    onChange: setWalkSpeed,
    parse: parseFloat,
    test: testWalkSpeed,
    value: Math.round(profileRequest.walkSpeed * 36) / 10 // m/s to km/h
  })

  const setWalkTime = useCallback(
    (maxWalkTime) => setProfileRequest({maxWalkTime}),
    [setProfileRequest]
  )
  const maxWalkTimeInput = useInput({
    onChange: setWalkTime,
    parse: parseInt,
    test: testWalkTime,
    value: profileRequest.maxWalkTime
  })

  const setBikeSpeed = useCallback(
    (bikeSpeed) => setProfileRequest({bikeSpeed: bikeSpeed / 3.6}), // km/h to m/s
    [setProfileRequest]
  )
  const bikeSpeedInput = useInput({
    onChange: setBikeSpeed,
    parse: parseFloat,
    test: testBikeSpeed,
    value: Math.round(profileRequest.bikeSpeed * 36) / 10
  })

  const setMaxBikeTime = useCallback(
    (maxBikeTime) => setProfileRequest({maxBikeTime}),
    [setProfileRequest]
  )
  const maxBikeTimeInput = useInput({
    onChange: setMaxBikeTime,
    parse: parseInt,
    test: testBikeTime,
    value: profileRequest.maxBikeTime
  })

  const setMonteCarlo = useCallback(
    (monteCarloDraws) => setProfileRequest({monteCarloDraws}),
    [setProfileRequest]
  )
  const monteCarloInput = useInput({
    onChange: setMonteCarlo,
    parse: parseInt,
    test: testMonteCarlo,
    value: profileRequest.monteCarloDraws
  })

  const setMaxRides = useCallback(
    (maxTransfers) => setProfileRequest({maxRides: maxTransfers + 1}),
    [setProfileRequest]
  )
  const maxTransfersInput = useInput({
    onChange: setMaxRides,
    parse: parseInt,
    test: testMaxTransfers,
    value: profileRequest.maxRides - 1 // Max rides is max transfers + 1, but transfers is common usage terminology
  })

  const hasBike =
    containsType(profileRequest, 'BICYCLE') ||
    containsType(profileRequest, 'BICYCLE_RENT')
  const hasTransit = profileRequest.transitModes.length > 0
  const hasWalk = containsType(profileRequest, 'WALK')

  return (
    <SimpleGrid columns={3} spacing={5} {...p}>
      {hasTransit && (
        <>
          <FormControl
            isDisabled={disabled}
            isInvalid={bundleOutOfDate || !dateIsValid}
          >
            <FormLabel>{message('analysis.date')}</FormLabel>
            <DateTimeWithRender
              closeOnSelect
              dateFormat={DATE_FORMAT}
              inputProps={{disabled}}
              onChange={setDate}
              renderInput={(p) => <Input {...p} />}
              timeFormat={false}
              utc // because new Date('2016-12-12') yields a date at midnight UTC
              value={date}
            />
          </FormControl>

          <TimePicker
            disabled={disabled}
            label={message('analysis.fromTime')}
            value={fromTime}
            onChange={setFromTime}
          />

          <TimePicker
            disabled={disabled}
            label={message('analysis.toTime')}
            value={toTime}
            onChange={setToTime}
          />

          {bundleOutOfDate && (
            <Alert status='error' gridColumn='1 / span 3'>
              <AlertIcon />
              <span dangerouslySetInnerHTML={{__html: bundleOutOfDate}} />
            </Alert>
          )}

          <FormControl
            isDisabled={disabled}
            isInvalid={monteCarloInput.isInvalid}
          >
            <FormLabel>{message('analysis.monteCarloDraws')}</FormLabel>
            <Input {...monteCarloInput} type='number' />
          </FormControl>

          <FormControl
            isDisabled={disabled}
            isInvalid={maxTransfersInput.isInvalid}
          >
            <FormLabel>{message('analysis.transfers')}</FormLabel>
            <Input {...maxTransfersInput} type='number' />
          </FormControl>

          <Divider borderColor={`${color}.100`} gridColumn='1 / span 3' />
        </>
      )}

      {hasWalk && (
        <>
          <FormControl
            isDisabled={disabled}
            isInvalid={walkSpeedInput.isInvalid}
          >
            <FormLabel htmlFor={walkSpeedInput.id}>Walk speed</FormLabel>
            <InputWithUnits {...walkSpeedInput} type='number' units='km/h' />
            <FormHelperText>Range 3-15</FormHelperText>
          </FormControl>

          {hasTransit && (
            <FormControl
              isDisabled={disabled}
              isInvalid={maxWalkTimeInput.isInvalid}
            >
              <FormLabel htmlFor={maxWalkTimeInput.id}>Max walk time</FormLabel>
              <InputWithUnits {...maxWalkTimeInput} units='minutes' />
              <FormHelperText>
                Maximum of 60. Lower time limits apply to transfers and egress
                legs.
              </FormHelperText>
            </FormControl>
          )}
          <div />

          <Divider borderColor={`${color}.100`} gridColumn='1 / span 3' />
        </>
      )}

      {hasBike && (
        <>
          <FormControl
            isDisabled={disabled}
            isInvalid={bikeSpeedInput.isInvalid}
          >
            <FormLabel htmlFor={bikeSpeedInput.id}>Bike speed</FormLabel>
            <InputWithUnits {...bikeSpeedInput} type='number' units='km/h' />
            <FormHelperText>Range 5-20</FormHelperText>
          </FormControl>

          {hasTransit && (
            <FormControl
              isDisabled={disabled}
              isInvalid={maxBikeTimeInput.isInvalid}
            >
              <FormLabel htmlFor={maxBikeTimeInput.id}>Max bike time</FormLabel>
              <InputWithUnits {...maxBikeTimeInput} units='minutes' />
              <FormHelperText>
                Maximum of 60. Lower time limits apply to transfer and egress
                legs.
              </FormHelperText>
            </FormControl>
          )}

          <FormControl isDisabled={disabled}>
            <FormLabel htmlFor='bikeLts'>Max Level of Traffic Stress</FormLabel>
            <Select
              id='bikeLts'
              onChange={(v) =>
                setProfileRequest({bikeTrafficStress: parseInt(v.target.value)})
              }
              value={get(profileRequest, 'bikeTrafficStress', 4)}
            >
              <option value={1}>1 - Low stress</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4 - High stress</option>
            </Select>
          </FormControl>

          <Divider borderColor={`${color}.100`} gridColumn='1 / span 3' />
        </>
      )}
    </SimpleGrid>
  )
}
