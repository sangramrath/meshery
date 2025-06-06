import { useState } from 'react';
import { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Colors } from '../themes/app';
import { Checkbox, MenuItem, Paper, FormControlLabel } from '@sistent/sistent';
import { useTheme } from '@sistent/sistent';

const MultiSelectWrapper = (props) => {
  const [selectInput, setSelectInput] = useState('');
  const allOption = { value: '*' };
  const theme = useTheme();

  const filterOptions = (options, input) =>
    options?.filter(({ label }) => label?.toLowerCase().includes(input.toLowerCase()));

  const comparator = (v1, v2) => {
    if (v1.value === '*') return 1;
    else if (v2.value === '*') return -1;

    return v1.label?.localeCompare(v2.label);
  };

  let filteredOptions = filterOptions(props.options, selectInput).sort(comparator);
  let filteredSelectedOptions = filterOptions(props.value, selectInput).sort(comparator);

  const Option = (props) => {
    return (
      <MenuItem
        buttonRef={props.innerRef}
        selected={props.isFocused}
        {...props.innerProps}
        component="div"
        style={{
          fontWeight: props.isSelected ? 500 : 400,
          padding: '0.4rem 1rem',
        }}
      >
        <FormControlLabel
          control={
            props.value === '*' && filteredSelectedOptions?.length > 0 ? (
              <>
                <Checkbox
                  key={props.value}
                  ref={(input) => {
                    if (input) input.indeterminate = true;
                  }}
                  style={{
                    padding: '0',
                  }}
                />
              </>
            ) : (
              <>
                <Checkbox
                  key={props.value}
                  checked={props.isSelected}
                  onChange={() => {}}
                  style={{
                    padding: '0',
                  }}
                />
              </>
            )
          }
          label={<span style={{ marginLeft: '0.5rem' }}>{props.label}</span>}
        />
      </MenuItem>
    );
  };

  const CustomInput = (props) => {
    return selectInput.length === 0 ? (
      <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
        {props.children}
      </components.Input>
    ) : (
      <div>
        <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
          {props.children}
        </components.Input>
      </div>
    );
  };

  const Menu = (props) => {
    return (
      <Paper
        square
        style={{ zIndex: 9999, width: '100%', position: 'absolute' }}
        {...props.innerProps}
      >
        {props.children}
      </Paper>
    );
  };

  const customFilterOption = ({ value, label }, input) =>
    (value !== '*' && label?.toLowerCase().includes(input.toLowerCase())) ||
    (value === '*' && filteredOptions?.length > 0);

  const onInputChange = (inputValue, event) => {
    if (event.action === 'input-change') setSelectInput(inputValue);
    else if (event.action === 'menu-close' && selectInput !== '') setSelectInput('');
  };

  const onKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !selectInput) e.preventDefault();
  };

  const handleChange = (selected) => {
    if (
      selected.length > 0 &&
      (selected[selected.length - 1].value === allOption.value ||
        JSON.stringify(filteredOptions.sort(comparator)) ===
          JSON.stringify(selected.sort(comparator)))
    ) {
      setSelectInput('');
      return props.onChange(
        [
          ...(props.value ?? []),
          ...props.options.filter(
            ({ label }) =>
              label?.toLowerCase().includes(selectInput?.toLowerCase()) &&
              (props.value ?? []).filter((opt) => opt.label === label).length === 0,
          ),
        ].sort(comparator),
        [],
      );
    } else if (
      selected.length > 0 &&
      selected[selected.length - 1].value !== allOption.value &&
      JSON.stringify(selected.sort(comparator)) !== JSON.stringify(filteredOptions.sort(comparator))
    ) {
      let filteredUnselectedOptions = filteredSelectedOptions.filter(
        (opts) => !selected.some((sel) => sel.value === opts.value),
      );
      setSelectInput('');
      return props.onChange(selected, filteredUnselectedOptions);
    } else {
      setSelectInput('');
      return props.onChange(
        [
          ...props.value.filter(
            ({ label }) => !label.toLowerCase().includes(selectInput?.toLowerCase()),
          ),
        ],
        filteredSelectedOptions.length == 1 ? filteredSelectedOptions : props.options,
      );
    }
  };

  const customStyles = {
    multiValueLabel: (def) => ({
      ...def,
      backgroundColor: 'lightgray',
    }),
    multiValueRemove: (def) => ({
      ...def,
      backgroundColor: 'lightgray',
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: '65px',
      overflow: 'auto',
    }),
    control: (base) => ({
      ...base,
      backgroundColor: base.backgroundColor2,
      borderColor: Colors.keppelGreen,
      color: Colors.keppelGreen,
      boxShadow: 'none',
      '&:hover': {
        borderColor: Colors.keppelGreen,
      },
      '&$focused': {
        borderColor: '#00B39F',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: base.backgroundColor2,
    }),
    input: (base) => ({
      ...base,
      color: theme.palette.text.primary,
    }),
  };

  return (
    <CreatableSelect
      {...props}
      inputValue={selectInput}
      onInputChange={onInputChange}
      onKeyDown={onKeyDown}
      options={filterOptions(props.options, selectInput)}
      onChange={handleChange}
      components={{
        Option: Option,
        Input: CustomInput,
        Menu: Menu,
        ...props.components,
      }}
      filterOption={customFilterOption}
      menuPlacement={props.menuPlacement ?? 'auto'}
      styles={customStyles}
      theme={(selectTheme) => ({
        ...selectTheme,
        colors: {
          ...selectTheme.colors,
          backgroundColor2: theme.palette.mode === 'dark' ? theme.palette.background.card : '#fff',
        },
      })}
      isMulti
      closeMenuOnSelect={false}
      tabSelectsValue={false}
      backspaceRemovesValue={false}
      hideSelectedOptions={false}
      isDisabled={props.updating}
      blurInputOnSelect={false}
    />
  );
};

export default MultiSelectWrapper;
