import {memo, forwardRef} from 'react'
import Select, {Props} from 'react-select'

import {CB_HEX, CB_RGB} from 'lib/constants'

export const selectStyles = {
  option: (styles, state) => ({
    ...styles,
    color: state.isSelected ? '#fff' : styles.color,
    backgroundColor: state.isSelected ? CB_HEX : styles.backgroundColor,
    '&:hover': {
      color: '#fff',
      backgroundColor: CB_HEX
    }
  }),
  control: (styles, state) => ({
    ...styles,
    boxShadow: state.isFocused
      ? `0 0 0 0.2rem rgba(${CB_RGB.r}, ${CB_RGB.g}, ${CB_RGB.b}, 0.25)`
      : 0,
    borderColor: state.isFocused ? CB_HEX : styles.borderColor,
    '&:hover': {
      borderColor: state.isFocused ? CB_HEX : styles.borderColor
    }
  })
}

// NB: React enforces `memo(forwardRef(...))`
export default memo<Props>(
  forwardRef((p: Props, ref) => (
    <Select innerRef={ref as any} styles={selectStyles} {...p} />
  ))
)
