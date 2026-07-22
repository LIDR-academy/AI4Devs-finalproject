import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/auth/presentation/widgets/auth_text_field.dart';

Future<void> showForgotPasswordDialog(
  BuildContext context, {
  String initialEmail = '',
}) {
  return showDialog<void>(
    context: context,
    builder: (dialogContext) => ForgotPasswordDialog(
      initialEmail: initialEmail,
      authBloc: context.read<AuthBloc>(),
    ),
  );
}

class ForgotPasswordDialog extends StatefulWidget {
  const ForgotPasswordDialog({
    super.key,
    required this.authBloc,
    this.initialEmail = '',
  });

  final AuthBloc authBloc;
  final String initialEmail;

  @override
  State<ForgotPasswordDialog> createState() => _ForgotPasswordDialogState();
}

class _ForgotPasswordDialogState extends State<ForgotPasswordDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  bool _isSubmitting = false;

  static final _emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);
    widget.authBloc.add(
      PasswordResetRequested(email: _emailController.text),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      bloc: widget.authBloc,
      listener: (context, state) {
        if (state is PasswordResetEmailSent || state is AuthFailure) {
          if (mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: AlertDialog(
        title: const Text('Recuperar contraseña'),
        content: Form(
          key: _formKey,
          child: AuthTextField(
            label: 'Email',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            autocorrect: false,
            onFieldSubmitted: (_) {
              if (!_isSubmitting) {
                _submit();
              }
            },
            validator: (value) {
              final trimmed = value?.trim() ?? '';
              if (trimmed.isEmpty || !_emailPattern.hasMatch(trimmed)) {
                return 'Introduce un email válido';
              }
              return null;
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: _isSubmitting ? null : _submit,
            child: _isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Enviar'),
          ),
        ],
      ),
    );
  }
}
