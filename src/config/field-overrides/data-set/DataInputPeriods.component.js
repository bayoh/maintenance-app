import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';

import getPeriod from 'd2/lib/period/parser';
import PeriodPicker from 'd2-ui/lib/period-picker/PeriodPicker.component';


const styles = {
    periodRow: { display: 'flex' },
    periodColumn: { flex: 2, paddingTop: 16 },
    dateColumn: { flex: 1 },
    datePicker: { display: 'inline-block' },
    datePickerField: { width: 100 },
    periodPicker: { display: 'inline-block' },
    iconButton: { top: 4 },
    divider: { marginTop: -9 },
    openDialogButton: { margin: '16px 0' },
};

class DataInputPeriods extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            dialogOpen: false,
            dataInputPeriods: props.value,
        };

        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.addPeriod = this.addPeriod.bind(this);
        this.removePeriod = this.removePeriod.bind(this);
        this.changePeriodDate = this.changePeriodDate.bind(this);

        this.handleCancel = this.handleCancel.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    openDialog() {
        this.setState({
            dialogOpen: true,
            dataInputPeriods: this.props.value.sort((a, b) => a.period.id.localeCompare(b.period.id))
        });
    }

    closeDialog() {
        this.setState({
            dialogOpen: false
        });
    }

    addPeriod(periodId) {
        if (this.state.dataInputPeriods.filter(dip => dip.period.id === periodId).length > 0) {
            console.info('Period was already added');
            return;
        }

        this.setState({
            dataInputPeriods: this.state.dataInputPeriods.concat({ period: { id: periodId } }),
        });
    }

    removePeriod(periodId) {
        this.setState({
            dataInputPeriods: this.state.dataInputPeriods.filter(dip => dip.period.id !== periodId),
        });
    }

    changePeriodDate(periodId, dateField, nothing, value) {
        this.setState({
            dataInputPeriods: this.state.dataInputPeriods.map(dip => {
                if (dip.period.id === periodId) {
                    dip[dateField] = value;
                }

                return dip;
            })
        });
    }

    handleCancel() {
        this.closeDialog();
    }

    handleSave() {
        this.props.onChange({
            target: {
                value: this.state.dataInputPeriods.map(dip => ({
                    period: {
                        id: dip.period.id,
                    },
                    openingDate: dip.openingDate,
                    closingDate: dip.closingDate,
                }))
            }
        });
        this.closeDialog();
    }

    renderDatePicker(labelText, dateValue, onChange, onCancelClick) {
        return (
            <div style={styles.dateColumn}>
                <DatePicker
                    floatingLabelText={labelText}
                    style={styles.datePicker}
                    textFieldStyle={styles.datePickerField}
                    value={dateValue}
                    container="inline"
                    autoOk
                    onChange={onChange}
                />
                {dateValue && (
                    <IconButton style={styles.iconButton} onClick={onCancelClick}>
                        <FontIcon
                            className="material-icons"
                            color="rgba(0,0,0,0.35)"
                            hoverColor="rgba(0,0,0,0.8)"
                            style={{ top: 4 }}
                        >clear</FontIcon>
                    </IconButton>
                )}
            </div>
        );
    }

    renderPeriods() {
        const removePeriodProxy = (periodId) => {
            return () => this.removePeriod(periodId);
        };

        const changeDateProxy = (periodId, dateField) => {
            return this.changePeriodDate.bind(this, periodId, dateField);
        };

        const removeDateProxy = (periodId, dateField) => {
            return () => this.changePeriodDate(periodId, dateField, null, null);
        };

        return (this.state.dataInputPeriods && this.state.dataInputPeriods.map(dataInputPeriod =>
            <div key={dataInputPeriod.period.id}>
                <div style={styles.periodRow}>
                    <div style={styles.periodColumn}>
                        <IconButton style={styles.iconButton} onClick={removePeriodProxy(dataInputPeriod.period.id)}>
                            <FontIcon
                                className="material-icons"
                                color="rgba(0,0,0,0.35)"
                                hoverColor="rgba(0,0,0,0.8)"
                                style={{ top: 4 }}
                            >delete</FontIcon>
                        </IconButton>
                        {getPeriod(dataInputPeriod.period.id).name}
                    </div>
                    {this.renderDatePicker(
                        this.getTranslation('opening_date'),
                        dataInputPeriod.openingDate && new Date(dataInputPeriod.openingDate),
                        changeDateProxy(dataInputPeriod.period.id, 'openingDate'),
                        removeDateProxy(dataInputPeriod.period.id, 'openingDate')
                    )}
                    {this.renderDatePicker(
                        this.getTranslation('closing_date'),
                        dataInputPeriod.closingDate && new Date(dataInputPeriod.closingDate),
                        changeDateProxy(dataInputPeriod.period.id, 'closingDate'),
                        removeDateProxy(dataInputPeriod.period.id, 'closingDate')
                    )}
                </div>
                <Divider style={styles.divider}/>
            </div>
        ));
    }

    render() {
        const actions = [
            <FlatButton label={this.getTranslation('cancel')} style={{ marginRight: 16 }} onClick={this.handleCancel}/>,
            <RaisedButton primary label={this.getTranslation('confirm')} onClick={this.handleSave}/>
        ];

        return <div>
            <RaisedButton
                label={this.getTranslation('data_input_periods')}
                style={styles.openDialogButton}
                onClick={this.openDialog}
            />
            <Dialog
                open={this.state.dialogOpen}
                onRequestClose={this.closeDialog}
                title={this.props.labelText}
                actions={actions}
                autoScrollBodyContent
                autoDetectWindowHeight
            >
                {this.renderPeriods()}
                <div style={styles.periodPicker}>
                    <PeriodPicker periodType={this.props.model.periodType} onPickPeriod={this.addPeriod}/>
                </div>
            </Dialog>
        </div>;
    }
}
DataInputPeriods.contextTypes = { d2: React.PropTypes.any };

export default DataInputPeriods;