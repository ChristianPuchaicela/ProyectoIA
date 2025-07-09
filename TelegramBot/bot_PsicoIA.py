from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes

import joblib
import librosa
import numpy as np
import os
from datetime import datetime

# Cargar modelo y herramientas
model = joblib.load("modelo_svm.pkl")
scaler = joblib.load("scaler.pkl")
pca = joblib.load("pca.pkl")
label_encoder = joblib.load("label_encoder.pkl")

# Diccionario de respuestas emocionales
respuestas = {
    'anger': '😠 Detecté que estás *enojado*. Tómate un respiro, cuenta hasta 10.',
    'disgust': '😒 Parece que estás *disgustado*. A veces es bueno alejarse un momento.',
    'fear': '😨 Te noto *asustado*. Recuerda que no estás solo.',
    'happiness': '😄 ¡Estás *feliz*! Me alegra mucho saberlo.',
    'neutral': '😐 Te siento *neutral*. Todo en equilibrio.',
    'sadness': '😢 Percibo *tristeza*. Si necesitas hablar, estoy aquí para ti.'
}

# Función de inicio
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("Enviar audio", callback_data='audio')],
                [InlineKeyboardButton("Escribir en diario", callback_data='diario')]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Hola, soy PsicoIA 🤖. ¿Qué deseas hacer?", reply_markup=reply_markup)

# Función para manejar botones
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == 'audio':
        await query.edit_message_text("🎙 Envíame un mensaje de voz y te diré cómo te sientes.")
    elif query.data == 'diario':
        await query.edit_message_text("📓 Escribe cómo te sientes y lo registraré en tu diario.")

# Función para registrar texto
async def texto_diario(update: Update, context: ContextTypes.DEFAULT_TYPE):
    texto = update.message.text
    usuario = update.effective_user.first_name or "Usuario"
    fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("diario_emocional.txt", "a", encoding="utf-8") as f:
        f.write(f"[{fecha}] {usuario}: {texto}\n")
    await update.message.reply_text("✍️ Gracias por compartir. He registrado tu entrada.")

# Handler de voz
async def voice_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        voice = update.message.voice
        file = await context.bot.get_file(voice.file_id)
        await file.download_to_drive("audio.ogg")
        os.system("ffmpeg -i audio.ogg audio.wav -y")
        y, sr = librosa.load("audio.wav", sr=22050)

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        mel = librosa.feature.melspectrogram(y=y, sr=sr)
        zcr = librosa.feature.zero_crossing_rate(y)
        rms = librosa.feature.rms(y=y)
        pitches, mags = librosa.piptrack(y=y, sr=sr, fmin=75, fmax=600)
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)

        pitch_vals = [pitches[mags[:, i].argmax(), i] for i in range(pitches.shape[1]) if pitches[mags[:, i].argmax(), i] > 0]
        pitch_feat = [np.mean(pitch_vals), np.std(pitch_vals), np.min(pitch_vals), np.max(pitch_vals)] if pitch_vals else [0, 0, 0, 0]

        features = np.concatenate([
            np.mean(mfcc, axis=1), np.std(mfcc, axis=1),
            np.mean(chroma, axis=1), np.std(chroma, axis=1),
            np.mean(librosa.power_to_db(mel), axis=1), np.std(librosa.power_to_db(mel), axis=1),
            [np.mean(zcr), np.std(zcr)],
            [np.mean(rms), np.std(rms)],
            pitch_feat,
            [np.mean(centroid), np.std(centroid)],
            [np.mean(rolloff), np.std(rolloff)]
        ])

        features_scaled = scaler.transform([features])
        features_pca = pca.transform(features_scaled)
        pred = model.predict(features_pca)
        emocion = label_encoder.inverse_transform(pred)[0]

        await update.message.reply_text(respuestas.get(emocion, "🤔 No pude identificar bien tu emoción."), parse_mode="Markdown")

    except Exception as e:
        await update.message.reply_text(f"❌ Error en la detección: {e}")

# Ejecutar el bot
if __name__ == "__main__":
    from telegram.ext import ApplicationBuilder

    async def main():
        app = ApplicationBuilder().token("7781414363:AAHMz-PyYOrbCa3WqO3eGMDulbeaXzQT5F0").build()

        app.add_handler(CommandHandler("start", start))
        app.add_handler(CallbackQueryHandler(button_handler))
        app.add_handler(MessageHandler(filters.VOICE, voice_handler))
        app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), texto_diario))

        print("✅ Bot corriendo... Esperando mensajes.")
        await app.run_polling()

    import asyncio
    import nest_asyncio

    try:
        asyncio.run(main())
    except RuntimeError:
        nest_asyncio.apply()
        asyncio.get_event_loop().run_until_complete(main())


