import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { AppButton, ErrorBanner, FilterChips, InputField, ScreenContainer } from '../components';
import type { ChipOption } from '../components';
import { useMutation } from '../hooks/useMutation';
import { RootStackScreenProps } from '../navigation/types';
import { rentalService } from '../services/rentalService';
import { IssueCategory } from '../types';
import { colors, spacing, typography } from '../theme';

const CATEGORIES: ChipOption<IssueCategory>[] = [
  { value: 'battery', label: 'Battery' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'tyre', label: 'Tyre / Puncture' },
  { value: 'lights', label: 'Lights' },
  { value: 'other', label: 'Other' },
];

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

export const ReportIssueScreen = ({ route, navigation }: RootStackScreenProps<'ReportIssue'>) => {
  const { rentalId, assetName } = route.params;
  const [category, setCategory] = useState<IssueCategory>('battery');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const report = useMutation(rentalService.reportIssue);

  const trimmed = description.trim();
  const descriptionError =
    trimmed.length === 0
      ? 'Please describe the issue.'
      : trimmed.length < MIN_LENGTH
        ? `Add a bit more detail (at least ${MIN_LENGTH} characters).`
        : null;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (descriptionError) return;
    const issue = await report.mutate(rentalId, { category, description: trimmed });
    if (issue) {
      if (Platform.OS !== 'web') {
        Alert.alert('Issue reported', 'Thanks! Our support team has been notified. The asset will be inspected after your trip.');
      }
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenContainer>
        <Text style={typography.h2}>What&apos;s wrong with {assetName}?</Text>
        <Text style={styles.sub}>Your trip keeps running. If the vehicle is unsafe, stop and end the trip.</Text>

        {report.error && <ErrorBanner message={report.error.message} />}

        <Text style={styles.label}>Issue type</Text>
        <FilterChips options={CATEGORIES} selected={category} onChange={setCategory} wrap />

        <View style={styles.field}>
          <InputField
            label="Description"
            placeholder="e.g. Rear brake feels loose when going downhill"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_LENGTH}
            style={styles.textArea}
            textAlignVertical="top"
            error={submitted ? descriptionError : null}
            helperText={`${trimmed.length}/${MAX_LENGTH}`}
            testID="issue-description"
          />
        </View>

        <AppButton title="Submit Report" icon="send" onPress={handleSubmit} loading={report.loading} testID="submit-issue" />
        <AppButton title="Cancel" variant="ghost" onPress={() => navigation.goBack()} style={styles.cancel} />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sub: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  field: { marginTop: spacing.xl },
  textArea: { minHeight: 110 },
  cancel: { marginTop: spacing.sm },
});
