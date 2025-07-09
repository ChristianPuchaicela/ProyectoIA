from tensorflow.keras.models import load_model

modelo = load_model("modelo.h5")
print("Forma de entrada esperada por el modelo:", modelo.input_shape)
