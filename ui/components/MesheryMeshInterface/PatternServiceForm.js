// @ts-check
import { AppBar, Box, IconButton, Toolbar, Tooltip, useTheme } from '@sistent/sistent';
import { Delete, HelpOutline } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import React, { useEffect } from 'react';
import { iconSmall } from '../../css/icons.styles';
import { pSBCr } from '../../utils/lightenOrDarkenColor';
import PatternServiceFormCore from './PatternServiceFormCore';

/**
 * PatternServiceForm renders a form from the workloads schema
 * @param {{
 *  schemaSet: { workload: any, type: string };
 *  onSubmit: Function;
 *  onDelete: Function;
 *  namespace: string;
 *  onChange?: Function
 *  onSettingsChange?: Function;
 *  formData?: Record<String, unknown>
 *  reference?: Record<any, any>;
 *  scroll?: Boolean; // If the window should be scrolled to zero after re-rendering
 *  color ?: string;
 * }} props
 * @returns
 */
function PatternServiceForm({
  formData,
  schemaSet,
  onSubmit,
  onDelete,
  reference,
  namespace,
  onSettingsChange,
  scroll = false,
  color,
}) {
  const theme = useTheme();

  useEffect(() => {
    schemaSet.workload.properties.name = {
      description: 'A descriptive label for this component. Must be unique within this design.',
      default: '<Name of the Component>',
      type: 'string',
    };
    schemaSet.workload.properties.namespace = {
      description:
        'A descriptive label for the Kubernetes namespace in which this component resides. All namespaced components must have a value in this field.',
      default: 'default',
      type: 'string',
    };
    schemaSet.workload.properties.labels = {
      description:
        'Use one or more labels to annotate your component with descriptive information in the form of key-value pairs. Components with matching key-value pairs are automatically visually grouped together.',
      additionalProperties: {
        type: 'string',
      },
      type: 'object',
    };
    schemaSet.workload.properties.annotations = {
      description:
        'Use one or more annotations to capture additional, extended details about this component in the form of key-value pairs. Components with matching annotations are automatically visually grouped together.',
      additionalProperties: {
        type: 'string',
      },
      type: 'object',
    };
  }, []);

  return (
    <PatternServiceFormCore
      formData={formData}
      schemaSet={schemaSet}
      onSubmit={onSubmit}
      onDelete={onDelete}
      reference={reference}
      namespace={namespace}
      onSettingsChange={onSettingsChange}
      scroll={scroll}
    >
      {(SettingsForm) => {
        return (
          <Box width={'100%'}>
            <AppBar
              style={{
                boxShadow: `0px 2px 4px -1px "#677E88"`,
                background: `${theme.palette.mode === 'dark' ? '#202020' : '#647881'}`,
                position: 'sticky',
                zIndex: 'auto',
              }}
            >
              <Toolbar
                variant="dense"
                style={{
                  padding: '0 5px',
                  paddingLeft: 16,
                  background: `linear-gradient(115deg, ${pSBCr(color, -20)} 0%, ${color} 100%)`,
                  height: '0.7rem !important',
                }}
              >
                <SettingsIcon style={{ ...iconSmall, color: 'black' }} />
                <p
                  style={{
                    margin: 'auto auto auto 10px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Settings
                </p>
                {schemaSet?.workload?.description && (
                  <label htmlFor="help-button">
                    <Tooltip title={schemaSet?.workload?.description} interactive>
                      <IconButton component="span">
                        <HelpOutline width="22px" style={{ color: '#fff' }} height="22px" />
                      </IconButton>
                    </Tooltip>
                  </label>
                )}
                <IconButton
                  component="span"
                  onClick={() =>
                    // @ts-ignore
                    reference.current.delete((settings) => ({
                      settings,
                    }))
                  }
                >
                  <Delete width="22px" height="22px" style={{ color: '#FFF' }} />
                </IconButton>
              </Toolbar>
            </AppBar>
            <SettingsForm />
          </Box>
        );
      }}
    </PatternServiceFormCore>
  );
}

export default PatternServiceForm;
