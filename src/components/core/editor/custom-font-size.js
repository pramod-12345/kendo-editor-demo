import * as React from 'react';
import PropTypes from 'prop-types'

import { EditorTools , EditorUtils } from '@progress/kendo-react-editor';
const fontSizeToolSettings = {
    style: 'font-size',
    defaultItem: { text: '16', value: '16pt' },
    items: [
        { text: '8', value: '8pt' },
        { text: '10', value: '10pt' },
        { text: '12', value: '12pt' },
        { text: '14',value: '14pt' },
        { text: '16',value: '16pt' },
        { text: '18',value: '18pt' },
        { text: '24', value: '24pt' },
        { text: '36', value: '36pt' },
    ],
    commandName: 'FontSize'
};

// Creates FontSize tool
const MyFontSizeTool =
  EditorTools.createStyleDropDownList(fontSizeToolSettings);
// Styles the FontSize tool
const CustomFontSize = (props) => {
    const view = props.view
    return(
        <MyFontSizeTool
            onChange={ (event) => {
                EditorUtils.applyInlineStyle(view,{ style: fontSizeToolSettings.style , value: event.value.value })
                var syntheticEvent = event.syntheticEvent;
                if (syntheticEvent && syntheticEvent.type === 'click') {
                    view.focus();
                }
            } }
            className='select-font-size'
            { ...props }
            style={ {
                width: '100px',
                fontSize: '16px',
                height: '36px',
                // eslint-disable-next-line react/prop-types
                ...props.style,
            } }
        />)
}

CustomFontSize.propTypes = {
    view: PropTypes.any
}

export { CustomFontSize };