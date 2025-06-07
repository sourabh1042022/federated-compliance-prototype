import flwr as fl
import numpy as np

X_train = np.array([[1.0], [2.0], [3.0]])
y_train = np.array([[1.0], [2.0], [3.0]])

class SimpleClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [np.array([[1.0]]), np.array([0.0])]

    def fit(self, parameters, config):
        return parameters, len(X_train), {}

    def evaluate(self, parameters, config):
        return 0.1, len(X_train), {"accuracy": 0.9}

fl.client.start_numpy_client(server_address="localhost:8080", client=SimpleClient())
