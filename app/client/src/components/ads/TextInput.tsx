import React, { forwardRef, Ref, useCallback, useMemo, useState } from "react";
import { Classes, CommonComponentProps, hexToRgba } from "./common";
import styled, { withTheme } from "styled-components";
import Text, { TextType } from "./Text";
import {
  ERROR_MESSAGE_NAME_EMPTY,
  createMessage,
  FORM_VALIDATION_INVALID_EMAIL,
} from "constants/messages";
import { isEmail } from "utils/formhelpers";
import Icon, { IconCollection, IconName, IconSize } from "./Icon";

import { AsyncControllableInput } from "@blueprintjs/core/lib/esm/components/forms/asyncControllableInput";

export type Validator = (
  value: string,
) => {
  isValid: boolean;
  message: string;
};

export function emailValidator(email: string) {
  let isValid = true;
  if (email) {
    isValid = isEmail(email);
  }
  return {
    isValid: isValid,
    message: !isValid ? createMessage(FORM_VALIDATION_INVALID_EMAIL) : "",
  };
}

export function notEmptyValidator(value: string) {
  const isValid = !!value;
  return {
    isValid: isValid,
    message: !isValid ? createMessage(ERROR_MESSAGE_NAME_EMPTY) : "",
  };
}

export type TextInputProps = CommonComponentProps & {
  placeholder?: string;
  fill?: boolean;
  defaultValue?: string;
  validator?: (value: string) => { isValid: boolean; message: string };
  onChange?: (value: string) => void;
  readOnly?: boolean;
  dataType?: string;
  theme?: any;
  leftIcon?: IconName;
  helperText?: string;
};

type boxReturnType = {
  bgColor: string;
  color: string;
  borderColor: string;
};

const boxStyles = (
  props: TextInputProps,
  isValid: boolean,
  theme: any,
): boxReturnType => {
  let bgColor = theme.colors.textInput.normal.bg;
  let color = theme.colors.textInput.normal.text;
  let borderColor = theme.colors.textInput.normal.border;

  if (props.disabled) {
    bgColor = theme.colors.textInput.disable.bg;
    color = theme.colors.textInput.disable.text;
    borderColor = theme.colors.textInput.disable.border;
  }
  if (props.readOnly) {
    bgColor = theme.colors.textInput.readOnly.bg;
    color = theme.colors.textInput.readOnly.text;
    borderColor = theme.colors.textInput.readOnly.border;
  }
  if (!isValid) {
    bgColor = hexToRgba(theme.colors.danger.main, 0.1);
    color = theme.colors.danger.main;
    borderColor = theme.colors.danger.main;
  }
  return { bgColor, color, borderColor };
};

const StyledInput = styled((props) => {
  // we are removing non input related props before passing them in the components
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dataType, inputRef, inputStyle, theme, ...inputProps } = props;
  return props.asyncControl ? (
    <AsyncControllableInput
      {...inputProps}
      dataType={dataType}
      inputRef={inputRef}
    />
  ) : (
    <input ref={inputRef} {...inputProps} />
  );
})<TextInputProps & { inputStyle: boxReturnType; isValid: boolean }>`
  width: ${(props) => (props.fill ? "100%" : "260px")};
  border-radius: 0;
  outline: 0;
  box-shadow: none;
  border: 1.2px solid ${(props) => props.inputStyle.borderColor};
  padding: 0px ${(props) => props.theme.spaces[5]}px;
  height: 36px;
  background-color: ${(props) => props.inputStyle.bgColor};
  color: ${(props) => props.inputStyle.color};

  ${(props) =>
    props.leftIcon &&
    IconCollection.includes(props.leftIcon) &&
    `
  padding-left: 35px;`};

  &:-internal-autofill-selected,
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px ${(props) => props.inputStyle.bgColor} inset !important;
    -webkit-text-fill-color: ${(props) => props.inputStyle.color} !important;
  }

  &:hover {
    background-color: ${(props) =>
      props.disabled
        ? props.inputStyle.bgColor
        : props.theme.colors.textInput.hover.bg};
  }
  &::placeholder {
    color: ${(props) => props.theme.colors.textInput.placeholder};
  }
  &:disabled {
    cursor: not-allowed;
  }
  ${(props) =>
    !props.readOnly
      ? `
  &:focus {
    border: 1px solid
      ${
        props.isValid
          ? props.theme.colors.info.main
          : props.theme.colors.danger.main
      };
    box-shadow: ${
      props.isValid
        ? "0px 0px 4px 4px rgba(203, 72, 16, 0.18)"
        : "0px 0px 4px 4px rgba(226, 44, 44, 0.18)"
    };
  }
  `
      : null};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  width: 100%;

  .${Classes.TEXT} {
    color: ${(props) => props.theme.colors.danger.main};
  }

  .helper {
    .${Classes.TEXT} {
      color: ${(props) => props.theme.colors.textInput.helper};
    }
  }
`;

const MsgWrapper = styled.div`
  position: absolute;
  bottom: -20px;
`;
const IconWrapper = styled.div`
  position: absolute;
  top: 10.37px;
  left: 14.37px;
`;
const TextInput = forwardRef(
  (props: TextInputProps, ref: Ref<HTMLInputElement>) => {
    const initialValidation = () => {
      let validationObj = { isValid: true, message: "" };
      if (props.defaultValue && props.validator) {
        validationObj = props.validator(props.defaultValue);
      }
      // return { isValid: false, message: "Error Message" };
      return validationObj;
    };

    const [validation, setValidation] = useState<{
      isValid: boolean;
      message: string;
    }>(initialValidation());

    const inputStyle = useMemo(
      () => boxStyles(props, validation.isValid, props.theme),
      [props, validation.isValid, props.theme],
    );

    const memoizedChangeHandler = useCallback(
      (el) => {
        const inputValue = el.target.value.trim();
        const validation = props.validator && props.validator(inputValue);
        if (validation) {
          props.validator && setValidation(validation);
          return (
            validation.isValid && props.onChange && props.onChange(inputValue)
          );
        } else {
          return props.onChange && props.onChange(inputValue);
        }
      },
      [props],
    );

    const ErrorMessage = (
      <MsgWrapper>
        <Text type={TextType.P3}>{validation.message}</Text>
      </MsgWrapper>
    );

    const HelperMessage = (
      <MsgWrapper className="helper">
        <Text type={TextType.P3}>* {props.helperText}</Text>
      </MsgWrapper>
    );
    const iconColor = !validation.isValid
      ? props.theme.colors.danger.main
      : props.theme.colors.textInput.icon;
    return (
      <InputWrapper>
        <StyledInput
          defaultValue={props.defaultValue}
          inputStyle={inputStyle}
          isValid={validation.isValid}
          ref={ref}
          type={props.dataType || "text"}
          {...props}
          data-cy={props.cypressSelector}
          inputRef={ref}
          onChange={memoizedChangeHandler}
          placeholder={props.placeholder}
          readOnly={props.readOnly}
        />
        {props.leftIcon && (
          <IconWrapper>
            <Icon
              fillColor={iconColor}
              name={props.leftIcon}
              size={IconSize.MEDIUM}
            />
          </IconWrapper>
        )}
        {validation.isValid &&
          props.helperText &&
          props.helperText.length > 0 &&
          HelperMessage}
        {ErrorMessage}
      </InputWrapper>
    );
  },
);

TextInput.displayName = "TextInput";

export default withTheme(TextInput);

export type InputType = "text" | "password" | "number" | "email" | "tel";
