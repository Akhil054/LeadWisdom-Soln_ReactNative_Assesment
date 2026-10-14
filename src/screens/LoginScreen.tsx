import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, ErrorBanner, InputField } from '../components';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '../hooks/useMutation';
import { useResponsive } from '../hooks/useResponsive';
import { authService } from '../services/authService';
import { colors, radius, spacing, typography } from '../theme';
import {
  detectIdentifierKind,
  normalizePhone,
  validateIdentifier,
  validatePassword,
} from '../utils/validation';

type Field = 'identifier' | 'password';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const passwordRef = useRef<TextInput>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({ identifier: false, password: false });

  const login = useMutation(authService.login);

  const errors = {
    identifier: validateIdentifier(identifier),
    password: validatePassword(password),
  };
  const kind = detectIdentifierKind(identifier);

  const handleSubmit = async () => {
    setTouched({ identifier: true, password: true });
    if (errors.identifier || errors.password) return;

    const id = kind === 'phone' ? normalizePhone(identifier) : identifier.trim().toLowerCase();
    const session = await login.mutate(id, password);
    if (session) await signIn(session); // navigator swaps to the app automatically
  };

  const markTouched = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { maxWidth: contentMaxWidth ?? 480 }]}>
            <View style={styles.logo}>
              <Ionicons name="flash" size={34} color={colors.white} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to rent e-scooters, e-bikes and mopeds near you.</Text>

            <View style={styles.card}>
              {login.error && <ErrorBanner message={login.error.message} />}

              <InputField
                label="Email or mobile number"
                placeholder="you@example.com or 98XXXXXXXX"
                icon={kind === 'phone' ? 'call-outline' : 'mail-outline'}
                value={identifier}
                onChangeText={(t) => {
                  setIdentifier(t);
                  if (login.error) login.reset();
                }}
                onBlur={() => markTouched('identifier')}
                error={touched.identifier ? errors.identifier : null}
                helperText={
                  kind === 'phone' ? 'Logging in with mobile number' : kind === 'email' ? 'Logging in with email' : undefined
                }
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                keyboardType="email-address"
                textContentType="username"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                testID="login-identifier"
              />

              <InputField
                ref={passwordRef}
                label="Password"
                placeholder="Minimum 6 characters"
                icon="lock-closed-outline"
                secureToggle
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (login.error) login.reset();
                }}
                onBlur={() => markTouched('password')}
                error={touched.password ? errors.password : null}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                testID="login-password"
              />

              <AppButton
                title="Log In"
                onPress={handleSubmit}
                loading={login.loading}
                testID="login-submit"
              />
            </View>

            <View style={styles.hint}>
              <Ionicons name="information-circle-outline" size={16} color={colors.info} />
              <Text style={styles.hintText}>
                Demo: any valid email (e.g. demo@leadwisdom.com) or 10-digit mobile, with a password of 6+ characters.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xxl },
  container: { width: '100%', alignSelf: 'center' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  hintText: { flex: 1, marginLeft: spacing.sm, fontSize: 12, color: colors.info },
});
