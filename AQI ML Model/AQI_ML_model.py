import numpy as np
import copy
from sklearn.preprocessing import StandardScaler
import pandas as pd
import os
import pickle
from sklearn.model_selection import train_test_split

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def softmax(z):
    z_stable = z - np.max(z, axis=1, keepdims=True)
    exp_z = np.exp(z_stable)
    return exp_z / np.sum(exp_z, axis=1, keepdims=True)

def compute_softmax_gradient(x, y, W, b):
    m, n = x.shape
    k = W.shape[1]
    z = np.dot(x, W) + b           
    probs = softmax(z)             

    y_one_hot = np.zeros((m, k))
    y_one_hot[np.arange(m), y] = 1

    diff = probs - y_one_hot      
    dW = (1 / m) * np.dot(x.T, diff)
    db = (1 / m) * np.sum(diff, axis=0, keepdims=True)

    eps = 1e-12
    loss = -np.sum(y_one_hot * np.log(probs + eps)) / m

    return loss, dW, db

def softmax_gradient_descent(x, y, W_in, b_in, alpha, num_iters):
    W = copy.deepcopy(W_in)
    b = b_in
    for i in range(num_iters):
        loss, dW, db = compute_softmax_gradient(x, y, W, b)
        W = W - alpha * dW
        b = b - alpha * db
        if i % 500 == 0:
            print(f"Iteration {i}, loss: {loss:.4f}")
    return W, b

def predict_proba_multiclass(x, W, b):
    z = np.dot(x, W) + b
    return softmax(z)

def predict_multiclass(x, W, b):
    probs = predict_proba_multiclass(x, W, b)
    return np.argmax(probs, axis=1)

def aqi_to_risk_class(a):
    if a <= 30:
        return 0   # Low
    elif a <= 60:
        return 1   # Moderate
    else:
        return 2   # High

df = pd.read_csv("UrbanAirPollutionDataset.csv")

feature_cols = ["PM2.5","PM10","NO₂","SO₂","CO","O₃","Temp_C","Humidity_%","Wind_Speed_mps","Pressure_hPa","Rain_mm",]

x = df[feature_cols].values.astype(float)
aqi = df["AQI_Target"].values.astype(float)

y = np.array([aqi_to_risk_class(v) for v in aqi])

print("AQI min:", aqi.min())
print("AQI max:", aqi.max())
unique, counts = np.unique(y, return_counts=True)
print("Class distribution (0=Low,1=Moderate,2=High):", dict(zip(unique, counts)))

mask = ~np.isnan(x).any(axis=1) & ~np.isnan(y)
x = x[mask]
y = y[mask]

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.20, random_state=23, stratify=y
)

scaler = StandardScaler()
x_train = scaler.fit_transform(x_train)
x_test = scaler.transform(x_test)

n_features = x_train.shape[1]
n_classes = len(np.unique(y))

W_in = np.zeros((n_features, n_classes))
b_in = np.zeros((1, n_classes))
alpha = 1.0e-2
num_iters = 10000

W_final, b_final = softmax_gradient_descent(x_train, y_train, W_in, b_in, alpha, num_iters)

os.makedirs("model", exist_ok=True)
with open("model/multi_model_params.pkl", "wb") as f:
    pickle.dump({"W": W_final, "b": b_final}, f)

with open("model/model_scaler.pkl", "wb") as f:
    pickle.dump({"scaler": scaler}, f)

train_preds = predict_multiclass(x_train, W_final, b_final)
train_accuracy = np.mean(train_preds == y_train) * 100
print(f"Training Accuracy: {train_accuracy:.2f}%")

test_preds = predict_multiclass(x_test, W_final, b_final)
test_accuracy = np.mean(test_preds == y_test) * 100
print(f"Test Accuracy: {test_accuracy:.2f}%")

probs_test = predict_proba_multiclass(x_test, W_final, b_final)

def risk_label_from_class(c):
    return {0: "Low Risk", 1: "Moderate Risk", 2: "High Risk"}.get(c, "Unknown")


def get_float(prompt):
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Please enter a numeric value.")

print("\nEnter pollution and weather values:")

pm25 = get_float("PM2.5 (µg/m³): ")
pm10 = get_float("PM10 (µg/m³): ")
no2 = get_float("NO₂ (µg/m³): ")
so2 = get_float("SO₂ (µg/m³): ")
co = get_float("CO: ")
o3 = get_float("O₃ (µg/m³): ")
temp_c = get_float("Temperature (°C): ")
humidity = get_float("Humidity (%): ")
wind_speed = get_float("Wind speed (m/s): ")
pressure = get_float("Pressure (hPa): ")
rain = get_float("Rain (mm): ")

user_array = np.array(
    [pm25, pm10, no2, so2, co, o3, temp_c, humidity, wind_speed, pressure, rain],
    dtype=float,
).reshape(1, -1)

user_array_scaled = scaler.transform(user_array)
user_probs = predict_proba_multiclass(user_array_scaled, W_final, b_final)[0]
user_class = np.argmax(user_probs)

print("\nUser input classification:")
print(f"Probabilities (Low, Moderate, High) = {user_probs}")
print(f"Predicted class = {user_class} ({risk_label_from_class(user_class)})")
